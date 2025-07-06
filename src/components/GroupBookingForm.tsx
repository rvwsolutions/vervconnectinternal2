import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  FileText, 
  Truck, 
  Coffee, 
  MessageSquare,
  X,
  Save,
  Plus,
  Minus,
  Check,
  Info
} from 'lucide-react';
import { Room, GroupBooking } from '../types';

interface GroupBookingFormProps {
  onClose: () => void;
  editingGroupBooking?: GroupBooking;
  onSave?: (groupBookingId: string) => void;
}

export function GroupBookingForm({ onClose, editingGroupBooking, onSave }: GroupBookingFormProps) {
  const { t } = useTranslation();
  const { rooms, addGroupBooking, updateGroupBooking } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<GroupBooking>>({
    groupName: editingGroupBooking?.groupName || '',
    contactPerson: editingGroupBooking?.contactPerson || '',
    contactEmail: editingGroupBooking?.contactEmail || '',
    contactPhone: editingGroupBooking?.contactPhone || '',
    totalRooms: editingGroupBooking?.totalRooms || 1,
    checkIn: editingGroupBooking?.checkIn || new Date().toISOString().split('T')[0],
    checkOut: editingGroupBooking?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: editingGroupBooking?.status || 'inquiry',
    specialRates: editingGroupBooking?.specialRates || 0,
    blockCode: editingGroupBooking?.blockCode || generateBlockCode(),
    roomsBlocked: editingGroupBooking?.roomsBlocked || [],
    contractTerms: editingGroupBooking?.contractTerms || '',
    paymentTerms: editingGroupBooking?.paymentTerms || '',
    cancellationPolicy: editingGroupBooking?.cancellationPolicy || '',
    amenitiesIncluded: editingGroupBooking?.amenitiesIncluded || [],
    meetingRoomsRequired: editingGroupBooking?.meetingRoomsRequired || false,
    cateringRequired: editingGroupBooking?.cateringRequired || false,
    transportationRequired: editingGroupBooking?.transportationRequired || false,
    notes: editingGroupBooking?.notes || '',
    currency: editingGroupBooking?.currency || hotelSettings.baseCurrency
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>(editingGroupBooking?.roomsBlocked || []);
  const [newAmenity, setNewAmenity] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  
  // Calculate total amount based on room rates and nights
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.specialRates) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
      const total = formData.specialRates * selectedRooms.length * nights;
      setCalculatedTotal(total);
    }
  }, [formData.checkIn, formData.checkOut, formData.specialRates, selectedRooms]);

  // Generate a random block code
  function generateBlockCode() {
    const prefix = 'GRP';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const year = new Date().getFullYear().toString().slice(-2);
    return `${prefix}${year}${randomNum}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const groupBookingData = {
      ...formData,
      roomsBlocked: selectedRooms,
      totalAmount: calculatedTotal,
      createdBy: user?.id || 'system'
    } as Omit<GroupBooking, 'id' | 'bookingIds' | 'createdAt'>;
    
    if (editingGroupBooking) {
      updateGroupBooking(editingGroupBooking.id, groupBookingData);
      if (onSave) onSave(editingGroupBooking.id);
    } else {
      const newId = addGroupBooking(groupBookingData);
      if (onSave) onSave(newId);
    }
    
    onClose();
  };

  const toggleRoomSelection = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(id => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenitiesIncluded?.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenitiesIncluded: [...(formData.amenitiesIncluded || []), newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenitiesIncluded: formData.amenitiesIncluded?.filter(a => a !== amenity)
    });
  };

  // Filter available rooms (not out of order or maintenance)
  const availableRooms = rooms.filter(room => 
    room.status !== 'out-of-order' && room.status !== 'maintenance'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {editingGroupBooking ? t('groupBooking.editGroupBooking') : t('groupBooking.newGroupBooking')}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Group Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.groupInformation')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.groupName')}</label>
                  <input
                    type="text"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.blockCode')}</label>
                  <input
                    type="text"
                    value={formData.blockCode}
                    onChange={(e) => setFormData({ ...formData, blockCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.contactInformation')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.contactPerson')}</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.contactEmail')}</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.contactPhone')}</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.bookingDetails')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.checkIn')}</label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.checkOut')}</label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.status')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="inquiry">{t('groupBooking.inquiry')}</option>
                    <option value="quoted">{t('groupBooking.quoted')}</option>
                    <option value="confirmed">{t('groupBooking.confirmed')}</option>
                    <option value="cancelled">{t('groupBooking.cancelled')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Room Selection */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{t('groupBooking.roomSelection')}</h4>
                <div className="text-sm text-gray-600">
                  {selectedRooms.length} {t('groupBooking.roomsSelected')}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('groupBooking.specialRate')} ({hotelSettings.baseCurrency})
                </label>
                <input
                  type="number"
                  value={formData.specialRates || ''}
                  onChange={(e) => setFormData({ ...formData, specialRates: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => toggleRoomSelection(room.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRooms.includes(room.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Room {room.number}</p>
                        <p className="text-xs text-gray-500 capitalize">{room.type} - {room.status}</p>
                      </div>
                      {selectedRooms.includes(room.id) && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedRooms.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">{t('groupBooking.estimatedTotal')}</span>
                    </div>
                    <span className="text-lg font-bold text-blue-800">
                      {formatCurrency(calculatedTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Services */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.additionalServices')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.meetingRoomsRequired}
                    onChange={(e) => setFormData({ ...formData, meetingRoomsRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('groupBooking.meetingRooms')}</span>
                </label>
                
                <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.cateringRequired}
                    onChange={(e) => setFormData({ ...formData, cateringRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('groupBooking.catering')}</span>
                </label>
                
                <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.transportationRequired}
                    onChange={(e) => setFormData({ ...formData, transportationRequired: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('groupBooking.transportation')}</span>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.includedAmenities')}</h4>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder={t('groupBooking.addAmenity')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.amenitiesIncluded?.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {(!formData.amenitiesIncluded || formData.amenitiesIncluded.length === 0) && (
                  <p className="text-sm text-gray-500">{t('groupBooking.noAmenities')}</p>
                )}
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.termsAndNotes')}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.contractTerms')}</label>
                  <textarea
                    value={formData.contractTerms}
                    onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.paymentTerms')}</label>
                  <textarea
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.cancellationPolicy')}</label>
                  <textarea
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupBooking.notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{editingGroupBooking ? t('groupBooking.updateGroupBooking') : t('groupBooking.createGroupBooking')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}