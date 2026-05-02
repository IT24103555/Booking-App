import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { eventApi } from '../../api/eventApi';
import { bookingApi } from '../../api/bookingApi';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { API_BASE_URL } from '../../config/apiConfig';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { colors } from '../../constants/colors';
import { bookingPaymentMethods } from '../../constants/status';
import { isCardHolderName, isCardExpiryValid, isCvvValid, isLuhnValid, isMobileMoneyPhone, isPositiveInt, isRequired, normalizeDigits } from '../../utils/validators';

export default function CreateBookingScreen({ route, navigation }) {
  const preEventId = route?.params?.eventId || '';
  const [eventId, setEventId] = useState(preEventId);
  const [ticketTypeId, setTicketTypeId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('Pay at Venue');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiryMonth, setCardExpiryMonth] = useState('');
  const [cardExpiryYear, setCardExpiryYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('MTN MoMo');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [bookableEventIds, setBookableEventIds] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [maxQuantity, setMaxQuantity] = useState(null);
  const [showEvents, setShowEvents] = useState(false);
  const [showTickets, setShowTickets] = useState(false);

  const activeTicketTypes = (items) => (items || []).filter((ticket) => ticket.status === 'Active');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventRes, ticketRes] = await Promise.all([
          eventApi.getAll(),
          ticketTypeApi.getAll(),
        ]);

        const allEvents = eventRes.data || [];
        const allTicketTypes = ticketRes.data || [];
        const activeBookableIds = Array.from(new Set(
          allTicketTypes
            .filter((ticket) => ticket.status === 'Active' && Number(ticket.availableQuantity) > 0)
            .map((ticket) => (typeof ticket.eventId === 'object' ? ticket.eventId?._id : ticket.eventId))
            .filter(Boolean)
        ));

        setBookableEventIds(activeBookableIds);
        setEvents(allEvents.filter((event) => activeBookableIds.includes(event._id)));

        if (preEventId) {
          const ev = allEvents.find((e) => e._id === preEventId);
          if (ev) {
            setSelectedEvent(ev);
            const ticketRes = await ticketTypeApi.getAll({ eventId: ev._id });
            setTicketTypes(activeTicketTypes(ticketRes.data));
            if (!activeBookableIds.includes(ev._id)) {
              setError('This event has no active ticket types available for booking.');
            }
          }
        }
      } catch (e) {
        // ignore - keep empty list
      }
    };
    load();
  }, [preEventId]);

  const onSave = async () => {
    setError('');
    if (!isRequired(eventId)) return setError('Event is required.');
    if (!isRequired(ticketTypeId)) return setError('Ticket type is required.');
    if (!bookableEventIds.includes(eventId)) return setError('Selected event has no active ticket types available for booking.');
    if (!ticketTypes.some((ticket) => ticket._id === ticketTypeId)) return setError('Please select a valid ticket type for the selected event.');
    if (!isPositiveInt(quantity)) return setError('Quantity must be greater than 0.');
    if (maxQuantity != null && Number(quantity) > maxQuantity) return setError(`Only ${maxQuantity} tickets available for selected ticket type.`);

    let paymentDetails = undefined;
    if (paymentMethod === 'Card') {
      const sanitizedCardNumber = normalizeDigits(cardNumber);
      const sanitizedCvv = normalizeDigits(cardCvv);
      if (!isCardHolderName(cardHolderName)) return setError('Cardholder name must use letters and common punctuation only.');
      if (!/^\d{13,19}$/.test(sanitizedCardNumber)) return setError('Card number must contain 13 to 19 digits.');
      if (!isLuhnValid(sanitizedCardNumber)) return setError('Card number is invalid.');
      if (!isCardExpiryValid(cardExpiryMonth, cardExpiryYear)) return setError('Card expiry date must be valid and not expired.');
      if (!isCvvValid(sanitizedCvv, sanitizedCardNumber)) return setError('CVV is invalid for the selected card.');
      paymentDetails = {
        cardHolderName: cardHolderName.trim(),
        cardNumber: sanitizedCardNumber,
        expiryMonth: cardExpiryMonth,
        expiryYear: cardExpiryYear,
        cvv: sanitizedCvv,
      };
    }

    if (paymentMethod === 'Mobile Money') {
      if (!isRequired(mobileMoneyProvider)) return setError('Mobile money provider is required.');
      if (!isMobileMoneyPhone(mobileMoneyPhone)) {
        return setError('Mobile money phone number must contain 7 to 15 digits.');
      }
      paymentDetails = {
        provider: mobileMoneyProvider.trim(),
        phoneNumber: String(mobileMoneyPhone).trim(),
      };
    }

    try {
      setSaving(true);
      const res = await bookingApi.create({
        eventId: eventId.trim(),
        ticketTypeId: ticketTypeId.trim(),
        quantity: Number(quantity),
        paymentMethod,
        ...(paymentDetails ? { paymentDetails } : {}),
      });
      Alert.alert('Success', 'Booking created and payment processed');
      navigation.replace('BookingDetails', { id: res.data._id });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Reserve tickets</Text>
            <Text style={styles.title}>Create a new booking</Text>
            <Text style={styles.subtitle}>Choose the event reference, ticket type, and quantity to confirm a reservation.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Booking information</Text>
            <ErrorMessage message={error} />
            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Event</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setShowEvents((s) => !s)} style={styles.selectorBox}>
                <Text style={styles.selectorText}>{events.find((e) => e._id === eventId)?.title || 'Select event / MongoDB ObjectId'}</Text>
              </TouchableOpacity>
              {showEvents && (
                <View style={styles.listBox}>
                  {events.map((e) => (
                    <TouchableOpacity key={e._id} style={styles.eventListItem} onPress={async () => {
                      try {
                        setShowEvents(false);
                        setShowTickets(false);
                        setTicketTypeId('');
                        setEventId(e._id);
                        // fetch full event detail (populated ticket types & venue)
                        const detail = await eventApi.getById(e._id);
                        const ev = detail.data || e;
                        setSelectedEvent(ev);
                        const ticketRes = await ticketTypeApi.getAll({ eventId: e._id });
                        const scopedTickets = activeTicketTypes(ticketRes.data).filter((ticket) => Number(ticket.availableQuantity) > 0);
                        setTicketTypes(scopedTickets);
                        if (scopedTickets.length === 0) {
                          setError('This event has no active ticket types available for booking.');
                        } else {
                          setError('');
                        }
                        // fetch sessions for event
                        try {
                          const sess = await sessionAgendaApi.getByEvent(e._id);
                          setSessions(sess.data || []);
                        } catch (se) {
                          setSessions([]);
                        }
                        setMaxQuantity(null);
                      } catch (err) {
                        // fallback
                        try {
                          const ticketRes = await ticketTypeApi.getAll({ eventId: e._id });
                          const scopedTickets = activeTicketTypes(ticketRes.data).filter((ticket) => Number(ticket.availableQuantity) > 0);
                          setTicketTypes(scopedTickets);
                          if (scopedTickets.length === 0) {
                            setError('This event has no active ticket types available for booking.');
                          } else {
                            setError('');
                          }
                        } catch (ticketErr) {
                          setTicketTypes([]);
                          setError('This event has no active ticket types available for booking.');
                        }
                        setSelectedEvent(e);
                        setSessions([]);
                      }
                    }}>
                      {e.image && (
                        <Image 
                          source={{ uri: encodeURI(`${UPLOADS_BASE}${e.image}`) }} 
                          style={styles.eventListImage}
                          resizeMode="cover"
                          onLoad={() => console.log('Image loaded', `${UPLOADS_BASE}${e.image}`)}
                          onError={(ev) => console.warn('Image load error', ev.nativeEvent?.error, `${UPLOADS_BASE}${e.image}`)}
                        />
                      )}
                      <View style={styles.eventListContent}>
                        <Text style={styles.listItemTitle}>{e.title}</Text>
                          <Text style={styles.listItemMeta}>{e.venueId?.name || ''} — {e.eventDate ? String(e.eventDate).slice(0,10) : ''}</Text>
                        <Text style={[styles.listItemMeta, { marginTop: 4 }]}>{e.description?.slice(0, 50)}...</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {selectedEvent && (
              <View style={[styles.selectorCard, { marginTop: 6 }]}>
                {selectedEvent.image && (
                  <Image 
                    source={{ uri: encodeURI(`${UPLOADS_BASE}${selectedEvent.image}`) }} 
                    style={styles.selectedEventImage}
                    resizeMode="cover"
                    onLoad={() => console.log('Image loaded', `${UPLOADS_BASE}${selectedEvent.image}`)}
                    onError={(ev) => console.warn('Image load error', ev.nativeEvent?.error, `${UPLOADS_BASE}${selectedEvent.image}`)}
                  />
                )}
                <Text style={[styles.selectorLabel, { marginTop: selectedEvent.image ? 12 : 0 }]}>Event details</Text>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{selectedEvent.title}</Text>
                <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{selectedEvent.description}</Text>
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={styles.selectorLabel}>Venue</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{selectedEvent.venueId?.name || '—'}</Text>
                  <Text style={{ color: colors.muted, marginTop: 4 }}>{selectedEvent.venueId?.location || selectedEvent.venueId?.description || ''}</Text>
                </View>
                {sessions.length > 0 && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={styles.selectorLabel}>Sessions</Text>
                    {sessions.map((s) => (
                      <View key={s._id} style={{ marginTop: 6 }}>
                        <Text style={{ color: colors.text, fontWeight: '700' }}>{s.title}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>{s.startTime ? `${s.startTime} — ${s.endTime || ''}` : s.description}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Ticket type</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setShowTickets((s) => !s)} style={styles.selectorBox}>
                <Text style={styles.selectorText}>{ticketTypes.find((t) => t._id === ticketTypeId)?.name || (eventId ? 'Select ticket type' : 'Select event first')}</Text>
              </TouchableOpacity>
              {showTickets && (
                <View style={styles.listBox}>
                  {ticketTypes.map((t) => (
                    <TouchableOpacity key={t._id} style={styles.listItem} onPress={() => { setTicketTypeId(t._id); setShowTickets(false); setMaxQuantity(typeof t.availableQuantity === 'number' ? t.availableQuantity : null); setQuantity('1'); }}>
                      <Text style={styles.listItemTitle}>{t.name}</Text>
                      <Text style={styles.listItemMeta}>{t.price ? `Price ${t.price}` : ''} {t.availableQuantity != null ? ` — ${t.availableQuantity} available` : ''}</Text>
                    </TouchableOpacity>
                  ))}
                  {ticketTypes.length === 0 && (
                    <View style={styles.emptyListItem}>
                      <Text style={styles.emptyListText}>No active ticket types available for this event.</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            {maxQuantity != null && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Available: {maxQuantity}</Text>
              </View>
            )}

            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Payment method</Text>
              <Text style={styles.paymentHint}>Choose how the customer will pay and enter the required payment details below.</Text>
              <View style={styles.paymentOptions}>
                {bookingPaymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method}
                    activeOpacity={0.85}
                    onPress={() => setPaymentMethod(method)}
                    style={[styles.paymentChip, paymentMethod === method && styles.paymentChipActive]}
                  >
                    <Text style={[styles.paymentChipText, paymentMethod === method && styles.paymentChipTextActive]}>{method}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.paymentSummary}>Selected: {paymentMethod}</Text>
            </View>

            {paymentMethod === 'Card' && (
              <View style={styles.selectorCard}>
                <Text style={styles.selectorLabel}>Card details</Text>
                <Text style={styles.paymentHint}>Card data is validated and only safe payment metadata is stored.</Text>
                <AppInput label="Cardholder name" value={cardHolderName} onChangeText={setCardHolderName} placeholder="Name on card" />
                <AppInput label="Card number" value={cardNumber} onChangeText={setCardNumber} placeholder="1234 5678 9012 3456" keyboardType="numeric" />
                <View style={styles.twoColumn}>
                  <View style={styles.fieldColumn}><AppInput label="Expiry month" value={cardExpiryMonth} onChangeText={setCardExpiryMonth} placeholder="MM" keyboardType="numeric" maxLength={2} /></View>
                  <View style={styles.fieldColumn}><AppInput label="Expiry year" value={cardExpiryYear} onChangeText={setCardExpiryYear} placeholder="YY or YYYY" keyboardType="numeric" maxLength={4} /></View>
                </View>
                <AppInput label="CVV" value={cardCvv} onChangeText={setCardCvv} placeholder="123" keyboardType="numeric" maxLength={4} />
              </View>
            )}

            {paymentMethod === 'Mobile Money' && (
              <View style={styles.selectorCard}>
                <Text style={styles.selectorLabel}>Mobile money details</Text>
                <Text style={styles.paymentHint}>Enter the provider and phone number used for the wallet payment.</Text>
                <AppInput label="Provider" value={mobileMoneyProvider} onChangeText={setMobileMoneyProvider} placeholder="MTN MoMo / Airtel Money / Vodafone Cash" />
                <AppInput label="Phone number" value={mobileMoneyPhone} onChangeText={setMobileMoneyPhone} placeholder="+256700000000" keyboardType="phone-pad" />
              </View>
            )}

            {paymentMethod === 'Pay at Venue' && (
              <View style={styles.selectorCard}>
                <Text style={styles.selectorLabel}>Pay at venue</Text>
                <Text style={styles.paymentHint}>No card details required. The booking will be created with payment pending at the venue.</Text>
              </View>
            )}

            <AppInput label="Quantity" value={quantity} onChangeText={(val) => {
              const digits = String(val).replace(/[^0-9]/g, '');
              if (digits === '') return setQuantity('');
              let n = parseInt(digits, 10) || 0;
              if (maxQuantity != null && n > maxQuantity) n = maxQuantity;
              if (n < 1) n = 1;
              setQuantity(String(n));
            }} placeholder="1" keyboardType="numeric" />
            <Text style={styles.helperText}>Payment details are required only for card and mobile money bookings.</Text>
            <AppButton title={saving ? 'Processing payment...' : paymentMethod === 'Card' ? 'Pay & Book' : paymentMethod === 'Mobile Money' ? 'Book & Pay' : 'Create booking'} onPress={onSave} disabled={saving || !eventId || ticketTypes.length === 0} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, padding: 20, backgroundColor: colors.background },
  shell: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24, marginBottom: 14, shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 14 }, elevation: 4 },
  kicker: { color: '#fff', opacity: 0.82, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 31, fontWeight: '900', marginTop: 7, letterSpacing: -0.5 },
  subtitle: { color: '#fff', opacity: 0.86, marginTop: 10, lineHeight: 22 },
  formCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '900', marginBottom: 12 },
  selectorCard: { backgroundColor: colors.background, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  selectorLabel: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 2 },
  selectorBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  selectorText: { color: colors.muted },
  listBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginTop: 8, backgroundColor: '#fff', maxHeight: 400, overflow: 'scroll' },
  listItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventListItem: { overflow: 'hidden', marginBottom: 1, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventListImage: { width: '100%', height: 140, backgroundColor: colors.background },
  eventListContent: { padding: 12 },
  selectedEventImage: { width: '100%', height: 240, borderRadius: 16, marginBottom: 12 },
  listItemTitle: { fontWeight: '700', color: colors.text },
  listItemMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  emptyListItem: { padding: 12 },
  emptyListText: { color: colors.muted, fontSize: 12 },
  helperText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 12 },
  paymentHint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  paymentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  paymentChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff' },
  paymentChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  paymentChipText: { color: colors.text, fontWeight: '800', fontSize: 12 },
  paymentChipTextActive: { color: '#fff' },
  paymentSummary: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  twoColumn: { flexDirection: 'row', gap: 10 },
  fieldColumn: { flex: 1 },
});
