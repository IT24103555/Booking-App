import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { eventApi } from '../../api/eventApi';
import { bookingApi } from '../../api/bookingApi';
import { ticketTypeApi } from '../../api/ticketTypeApi';
import { sessionAgendaApi } from '../../api/sessionAgendaApi';
import { API_BASE_URL } from '../../config/apiConfig';
import { getErrorMessage } from '../../api/apiClient';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import ErrorMessage from '../../components/ErrorMessage';
import { bookingPaymentMethods } from '../../constants/status';
import {
  isCardHolderName,
  isCardExpiryValid,
  isCvvValid,
  isLuhnValid,
  isMobileMoneyPhone,
  isPositiveInt,
  isRequired,
  normalizeDigits,
} from '../../utils/validators';

const UPLOADS_BASE = API_BASE_URL && API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL || 'http://localhost:5000';
const UI = { primary: '#EC168C', purple: '#7C3AED', background: '#FFF7FC', surface: '#FFFFFF', text: '#111827', muted: '#7C7C8A', border: '#F0DDEB', softPink: '#FFE7F4' };
const imageUrl = (image) => !image ? null : String(image).startsWith('http') ? image : encodeURI(`${UPLOADS_BASE}${image}`);

function QuantityButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity disabled={disabled} activeOpacity={0.8} style={[styles.qtyButton, disabled && styles.qtyButtonDisabled]} onPress={onPress}>
      <Text style={styles.qtyButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function OptionChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.optionChip, selected && styles.optionChipActive]}>
      <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

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
  const [showEvents, setShowEvents] = useState(false);

  const activeTicketTypes = (items) => (items || []).filter((ticket) => ticket.status === 'Active');
  const selectedTicket = useMemo(() => ticketTypes.find((t) => t._id === ticketTypeId), [ticketTypes, ticketTypeId]);
  const maxQuantity = selectedTicket ? Number(selectedTicket.availableQuantity || 0) : null;
  const totalAmount = selectedTicket ? Number(selectedTicket.price || 0) * Number(quantity || 0) : 0;

  useEffect(() => {
    const load = async () => {
      try {
        const [eventRes, ticketRes] = await Promise.all([eventApi.getAll(), ticketTypeApi.getAll()]);
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
          if (ev) await selectEvent(ev, activeBookableIds);
        }
      } catch (e) {
        setEvents([]);
      }
    };
    load();
  }, [preEventId]);

  const selectEvent = async (event, activeIds = bookableEventIds) => {
    setSelectedEvent(event);
    setEventId(event._id);
    setTicketTypeId('');
    setQuantity('1');
    setShowEvents(false);
    try {
      const [ticketRes, sessionRes] = await Promise.all([
        ticketTypeApi.getAll({ eventId: event._id }),
        sessionAgendaApi.getByEvent ? sessionAgendaApi.getByEvent(event._id) : Promise.resolve({ data: [] }),
      ]);
      const activeTickets = activeTicketTypes(ticketRes.data);
      setTicketTypes(activeTickets);
      setSessions(sessionRes.data || []);
      if (!activeIds.includes(event._id) || activeTickets.length === 0) setError('This event has no active ticket types available for booking.');
      else setError('');
    } catch (e) {
      setTicketTypes([]);
      setSessions([]);
    }
  };

  const changeQuantity = (next) => {
    const safe = Math.max(1, Number(next || 1));
    const limited = maxQuantity != null ? Math.min(safe, maxQuantity) : safe;
    setQuantity(String(limited));
  };

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
      paymentDetails = { cardHolderName: cardHolderName.trim(), cardNumber: sanitizedCardNumber, expiryMonth: cardExpiryMonth, expiryYear: cardExpiryYear, cvv: sanitizedCvv };
    }
    if (paymentMethod === 'Mobile Money') {
      if (!isRequired(mobileMoneyProvider)) return setError('Mobile money provider is required.');
      if (!isMobileMoneyPhone(mobileMoneyPhone)) return setError('Mobile money phone number must contain 7 to 15 digits.');
      paymentDetails = { provider: mobileMoneyProvider.trim(), phoneNumber: String(mobileMoneyPhone).trim() };
    }

    try {
      setSaving(true);
      const res = await bookingApi.create({ eventId: eventId.trim(), ticketTypeId: ticketTypeId.trim(), quantity: Number(quantity), paymentMethod, ...(paymentDetails ? { paymentDetails } : {}) });
      Alert.alert('Success', 'Booking created and payment processed');
      navigation.replace('BookingDetails', { id: res.data._id });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const uri = imageUrl(selectedEvent?.image);
  const paymentOptions = bookingPaymentMethods?.length ? bookingPaymentMethods : ['Pay at Venue', 'Card', 'Mobile Money'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={styles.backText}>‹</Text></TouchableOpacity>
              <Text style={styles.headerTitle}>Create Booking</Text>
              <View style={styles.backPlaceholder} />
            </View>

            <ErrorMessage message={error} />

            <View style={styles.eventSelectorCard}>
              <Text style={styles.sectionTitle}>Select Event</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setShowEvents((s) => !s)} style={styles.selectorBox}>
                <Text style={[styles.selectorText, !selectedEvent && styles.placeholderText]}>{selectedEvent?.title || 'Choose available event'}</Text>
                <Text style={styles.selectorArrow}>{showEvents ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              {showEvents ? (
                <View style={styles.dropdownList}>
                  {events.map((ev) => (
                    <TouchableOpacity key={ev._id} style={styles.dropdownItem} onPress={() => selectEvent(ev)}>
                      <Text style={styles.dropdownTitle}>{ev.title}</Text>
                      <Text style={styles.dropdownMeta}>{String(ev.eventDate || '').slice(0, 10)} · {ev.venueId?.name || 'Venue TBA'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            {selectedEvent ? (
              <View style={styles.selectedEventCard}>
                {uri ? <Image source={{ uri }} style={styles.eventImage} /> : <View style={[styles.eventImage, styles.placeholder]}><Text style={styles.placeholderIcon}>🎫</Text></View>}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.eventMeta}>{String(selectedEvent.eventDate || '').slice(0, 10)} · {selectedEvent.startTime || '--:--'}</Text>
                  <Text style={styles.eventMeta}>{selectedEvent.venueId?.name || 'Venue TBA'}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Select Ticket Type</Text>
              {ticketTypes.length === 0 ? <Text style={styles.helperText}>Select an event to view available ticket types.</Text> : null}
              {ticketTypes.map((ticket) => {
                const selected = ticket._id === ticketTypeId;
                return (
                  <TouchableOpacity key={ticket._id} style={[styles.ticketCard, selected && styles.ticketCardActive]} onPress={() => { setTicketTypeId(ticket._id); changeQuantity(1); }}>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketName}>{ticket.name}</Text>
                      <Text style={styles.ticketDesc}>{ticket.description || 'Access to event activities.'}</Text>
                      <Text style={styles.ticketPrice}>NPR {Number(ticket.price || 0).toFixed(0)}</Text>
                      <Text style={styles.ticketAvailable}>{ticket.availableQuantity} available</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <QuantityButton label="−" disabled={!selected || Number(quantity) <= 1} onPress={() => changeQuantity(Number(quantity) - 1)} />
                      <Text style={styles.quantityText}>{selected ? quantity : 0}</Text>
                      <QuantityButton label="＋" disabled={!selected || (maxQuantity != null && Number(quantity) >= maxQuantity)} onPress={() => changeQuantity(Number(quantity) + 1)} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {sessions.length ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Event Agenda</Text>
                {sessions.slice(0, 3).map((s) => (
                  <View key={s._id || s.title} style={styles.sessionRow}>
                    <Text style={styles.sessionTime}>{s.startTime || '--:--'}</Text>
                    <View style={styles.sessionContent}>
                      <Text style={styles.sessionTitle}>{s.title}</Text>
                      <Text style={styles.sessionSpeaker}>{s.speaker || 'Speaker TBA'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.optionRow}>
                {paymentOptions.map((method) => <OptionChip key={method} label={method} selected={paymentMethod === method} onPress={() => setPaymentMethod(method)} />)}
              </View>
              {paymentMethod === 'Card' ? (
                <View style={styles.paymentFields}>
                  <AppInput label="Cardholder Name" value={cardHolderName} onChangeText={setCardHolderName} placeholder="Name on card" />
                  <AppInput label="Card Number" value={cardNumber} onChangeText={setCardNumber} placeholder="1234 5678 9012 3456" keyboardType="number-pad" />
                  <View style={styles.rowFields}>
                    <View style={styles.flexField}><AppInput label="MM" value={cardExpiryMonth} onChangeText={setCardExpiryMonth} placeholder="MM" keyboardType="number-pad" /></View>
                    <View style={styles.flexField}><AppInput label="YYYY" value={cardExpiryYear} onChangeText={setCardExpiryYear} placeholder="YYYY" keyboardType="number-pad" /></View>
                    <View style={styles.flexField}><AppInput label="CVV" value={cardCvv} onChangeText={setCardCvv} placeholder="CVV" keyboardType="number-pad" secureTextEntry /></View>
                  </View>
                </View>
              ) : null}
              {paymentMethod === 'Mobile Money' ? (
                <View style={styles.paymentFields}>
                  <AppInput label="Provider" value={mobileMoneyProvider} onChangeText={setMobileMoneyProvider} placeholder="Provider" />
                  <AppInput label="Phone Number" value={mobileMoneyPhone} onChangeText={setMobileMoneyPhone} placeholder="Mobile money number" keyboardType="phone-pad" />
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>NPR {Number(totalAmount || 0).toFixed(0)}</Text>
            </View>
            <TouchableOpacity style={[styles.confirmButton, saving && styles.confirmButtonDisabled]} disabled={saving} onPress={onSave}>
              <Text style={styles.confirmButtonText}>{saving ? 'Confirming...' : 'Confirm Booking'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.background },
  keyboardView: { flex: 1 },
  screen: { flex: 1, backgroundColor: UI.background },
  page: { padding: 18, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: UI.border },
  backText: { color: UI.text, fontSize: 28, lineHeight: 28, fontWeight: '900' },
  backPlaceholder: { width: 40, height: 40 },
  headerTitle: { color: UI.text, fontWeight: '900', fontSize: 17 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: UI.border, marginTop: 14, shadowColor: '#9D174D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 5 },
  eventSelectorCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: UI.border },
  sectionTitle: { color: UI.text, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  selectorBox: { height: 54, borderRadius: 18, backgroundColor: '#FFF8FC', borderWidth: 1, borderColor: UI.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { color: UI.text, fontWeight: '800', flex: 1 },
  placeholderText: { color: UI.muted },
  selectorArrow: { color: UI.primary, fontSize: 22, fontWeight: '900' },
  dropdownList: { marginTop: 10, borderRadius: 18, borderWidth: 1, borderColor: UI.border, overflow: 'hidden' },
  dropdownItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: '#F7E8F2', backgroundColor: '#fff' },
  dropdownTitle: { color: UI.text, fontWeight: '900' },
  dropdownMeta: { color: UI.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  selectedEventCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 12, borderWidth: 1, borderColor: UI.border, marginTop: 14 },
  eventImage: { width: 86, height: 86, borderRadius: 18, backgroundColor: UI.softPink },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 26 },
  eventInfo: { flex: 1, paddingLeft: 13, justifyContent: 'center' },
  eventTitle: { color: UI.text, fontWeight: '900', fontSize: 15, lineHeight: 20 },
  eventMeta: { color: UI.muted, fontSize: 12, fontWeight: '700', marginTop: 5 },
  helperText: { color: UI.muted, fontWeight: '700', lineHeight: 20 },
  ticketCard: { borderWidth: 1.5, borderColor: UI.border, backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  ticketCardActive: { borderColor: UI.primary, backgroundColor: '#FFF6FB' },
  ticketInfo: { flex: 1 },
  ticketName: { color: UI.text, fontSize: 15, fontWeight: '900' },
  ticketDesc: { color: UI.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  ticketPrice: { color: UI.primary, fontSize: 13, fontWeight: '900', marginTop: 8 },
  ticketAvailable: { color: UI.muted, fontSize: 11, fontWeight: '700', marginTop: 3 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, borderColor: UI.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  qtyButtonDisabled: { opacity: 0.35 },
  qtyButtonText: { color: UI.primary, fontWeight: '900', fontSize: 15 },
  quantityText: { minWidth: 24, textAlign: 'center', color: UI.text, fontWeight: '900' },
  sessionRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7E8F2' },
  sessionTime: { color: UI.primary, fontWeight: '900', width: 54 },
  sessionContent: { flex: 1 },
  sessionTitle: { color: UI.text, fontWeight: '900' },
  sessionSpeaker: { color: UI.muted, fontSize: 12, marginTop: 4, fontWeight: '700' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FFF8FC', borderRadius: 999, borderWidth: 1, borderColor: UI.border },
  optionChipActive: { backgroundColor: UI.primary, borderColor: UI.primary },
  optionChipText: { color: UI.text, fontWeight: '800', fontSize: 12 },
  optionChipTextActive: { color: '#fff' },
  paymentFields: { marginTop: 14 },
  rowFields: { flexDirection: 'row', gap: 8 },
  flexField: { flex: 1 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: UI.border, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  totalLabel: { color: UI.muted, fontSize: 12, fontWeight: '800' },
  totalValue: { color: UI.primary, fontSize: 18, fontWeight: '900', marginTop: 3 },
  confirmButton: { flex: 1, backgroundColor: UI.primary, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: UI.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  confirmButtonDisabled: { opacity: 0.55 },
  confirmButtonText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
