import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Search,
  Filter,
  Calendar,
  Building,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Send,
  Eye,
  Bed,
  DollarSign,
  Tag,
  Briefcase,
  User
} from 'lucide-react';
import { GroupBooking, Room } from '../types';

interface GroupBookingManagementProps {
  onClose?: () => void;
}

export function GroupBookingManagement({ onClose }: GroupBookingManagementProps) {
  const { 
    groupBookings, 
    addGroupBooking, 
    updateGroupBooking, 
    deleteGroupBooking,
    rooms
  } = useHotel();
  const { formatCurrency, hotelSettings } = useCurrency();
  
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<GroupBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || showBookingDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, showBookingDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inquiry': return <Clock className="w-4 h-4" />;
      case 'quoted': return <FileText className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Filter bookings based on search and filters
  const filteredBookings = groupBookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const BookingForm = () => {
    const [formData, setFormData] = useState({
      groupName: editingBooking?.groupName || '',
      contactPerson: editingBooking?.contactPerson || '',
      contactEmail: editingBooking?.contactEmail || '',
      contactPhone: editingBooking?.contactPhone || '',
      totalRooms: editingBooking?.totalRooms || 1,
      checkIn: editingBooking?.checkIn || '',
      checkOut: editingBooking?.checkOut || '',
      status: editingBooking?.status || 'inquiry',
      specialRates: editingBooking?.specialRates || 0,
      blockCode: editingBooking?.blockCode || '',
      roomsBlocked: editingBooking?.roomsBlocked || [],
      roomsBooked: editingBooking?.roomsBooked || [],
      contractTerms: editingBooking?.contractTerms || '',
      paymentTerms: editingBooking?.paymentTerms || '',
      cancellationPolicy: editingBooking?.cancellationPolicy || '',
      amenitiesIncluded: editingBooking?.amenitiesIncluded || [],
      meetingRoomsRequired: editingBooking?.meetingRoomsRequired || false,
      cateringRequired: editingBooking?.cateringRequired || false,
      transportationRequired: editingBooking?.transportationRequired || false,
      notes: editingBooking?.notes || ''
    });

    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [newAmenity, setNewAmenity] = useState('');

    // Filter available rooms based on date range
    useEffect(() => {
      if (formData.checkIn && formData.checkOut) {
        // In a real app, this would filter rooms not booked during the date range
        // For demo, we'll just show all rooms
        setAvailableRooms(rooms);
      }
    }, [formData.checkIn, formData.checkOut, rooms]);

    const addRoomToBlocked = () => {
      if (selectedRoom && !formData.roomsBlocked.includes(selectedRoom)) {
        setFormData({
          ...formData,
          roomsBlocked: [...formData.roomsBlocked, selectedRoom]
        });
        setSelectedRoom('');
      }
    };

    const removeRoomFromBlocked = (roomId: string) => {
      setFormData({
        ...formData,
        roomsBlocked: formData.roomsBlocked.filter(id => id !== roomId)
      });
    };

    const addAmenity = () => {
      if (newAmenity.trim() && !formData.amenitiesIncluded.includes(newAmenity.trim())) {
        setFormData({
          ...formData,
          amenitiesIncluded: [...formData.amenitiesIncluded, newAmenity.trim()]
        });
        setNewAmenity('');
      }
    };

    const removeAmenity = (amenity: string) => {
      setFormData({
        ...formData,
        amenitiesIncluded: formData.amenitiesIncluded.filter(a => a !== amenity)
      });
    };

    const generateBlockCode = () => {
      const prefix = formData.groupName.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const blockCode = `${prefix}${randomNum}`;
      setFormData({
        ...formData,
        blockCode
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingBooking) {
        updateGroupBooking(editingBooking.id, formData);
      } else {
        addGroupBooking(formData);
      }
      
      setShowForm(false);
      setEditingBooking(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBooking ? 'Edit Group Booking' : 'Create Group Booking'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Group Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Group Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
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
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms Needed</label>
                    <input
                      type="number"
                      value={formData.totalRooms}
                      onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="inquiry">Inquiry</option>
                      <option value="quoted">Quoted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Rate ({hotelSettings.baseCurrency})
                    </label>
                    <input
                      type="number"
                      value={formData.specialRates}
                      onChange={(e) => setFormData({ ...formData, specialRates: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block Code</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.blockCode}
                        onChange={(e) => setFormData({ ...formData, blockCode: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., CORP1234"
                      />
                      <button
                        type="button"
                        onClick={generateBlockCode}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Blocking */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Room Blocking</h4>
                
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a room to block</option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          Room {room.number} - {room.type} ({formatCurrency(room.rate)}/night)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addRoomToBlocked}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add Room
                    </button>
                  </div>
                </div>
                
                {formData.roomsBlocked.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Blocked Rooms ({formData.roomsBlocked.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {formData.roomsBlocked.map(roomId => {
                        const room = rooms.find(r => r.id === roomId);
                        return room ? (
                          <div key={roomId} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">Room {room.number}</p>
                              <p className="text-xs text-gray-500">{room.type} - {formatCurrency(room.rate)}/night</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRoomFromBlocked(roomId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Bed className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No rooms blocked yet</p>
                    <p className="text-sm text-gray-400">Select rooms to block for this group</p>
                  </div>
                )}
              </div>

              {/* Additional Services */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.meetingRoomsRequired}
                      onChange={(e) => setFormData({ ...formData, meetingRoomsRequired: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Meeting Rooms Required</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.cateringRequired}
                      onChange={(e) => setFormData({ ...formData, cateringRequired: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Catering Required</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.transportationRequired}
                      onChange={(e) => setFormData({ ...formData, transportationRequired: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Transportation Required</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Included Amenities</label>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Welcome Drink, Free Breakfast"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.amenitiesIncluded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.amenitiesIncluded.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                          <span className="text-sm">{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No amenities added yet</p>
                  )}
                </div>
              </div>

              {/* Terms and Notes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Terms and Notes</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Terms</label>
                    <textarea
                      value={formData.contractTerms}
                      onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Enter contract terms..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <textarea
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Enter payment terms..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                    <textarea
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Enter cancellation policy..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Enter any additional notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingBooking ? 'Update Booking' : 'Create Booking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const BookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedBooking.groupName}</h3>
              <button
                onClick={() => {
                  setShowBookingDetails(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Group Information</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Group Name</p>
                        <p className="font-medium">{selectedBooking.groupName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="font-medium">{selectedBooking.contactPerson}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedBooking.contactEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedBooking.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Check-in</span>
                      </div>
                      <span className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Check-out</span>
                      </div>
                      <span className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bed className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Total Rooms</span>
                      </div>
                      <span className="font-medium">{selectedBooking.totalRooms}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Block Code</span>
                      </div>
                      <span className="font-medium">{selectedBooking.blockCode || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Special Rate</span>
                      </div>
                      <span className="font-medium">
                        {selectedBooking.specialRates ? formatCurrency(selectedBooking.specialRates) : 'Standard Rate'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Status</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Rooms</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Blocked Rooms ({selectedBooking.roomsBlocked.length})</p>
                      {selectedBooking.roomsBlocked.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.roomsBlocked.map(roomId => {
                            const room = rooms.find(r => r.id === roomId);
                            return room ? (
                              <div key={roomId} className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium">Room {room.number}</p>
                                <p className="text-xs text-gray-600">{room.type} - {formatCurrency(room.rate)}/night</p>
                              </div>
                            ) : (
                              <div key={roomId} className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-500">Unknown Room</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No rooms blocked yet</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Booked Rooms ({selectedBooking.roomsBooked.length})</p>
                      {selectedBooking.roomsBooked.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.roomsBooked.map(roomId => {
                            const room = rooms.find(r => r.id === roomId);
                            return room ? (
                              <div key={roomId} className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium">Room {room.number}</p>
                                <p className="text-xs text-gray-600">{room.type} - {formatCurrency(room.rate)}/night</p>
                              </div>
                            ) : (
                              <div key={roomId} className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-500">Unknown Room</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No rooms booked yet</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedBooking.meetingRoomsRequired ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selectedBooking.meetingRoomsRequired ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className="text-sm">Meeting Rooms Required</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedBooking.cateringRequired ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selectedBooking.cateringRequired ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className="text-sm">Catering Required</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedBooking.transportationRequired ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selectedBooking.transportationRequired ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className="text-sm">Transportation Required</span>
                    </div>
                  </div>
                  
                  {selectedBooking.amenitiesIncluded && selectedBooking.amenitiesIncluded.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Included Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.amenitiesIncluded.map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {(selectedBooking.contractTerms || selectedBooking.paymentTerms || selectedBooking.cancellationPolicy || selectedBooking.notes) && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Terms and Notes</h4>
                    
                    <div className="space-y-4">
                      {selectedBooking.contractTerms && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contract Terms</p>
                          <p className="text-sm text-gray-600 mt-1">{selectedBooking.contractTerms}</p>
                        </div>
                      )}
                      
                      {selectedBooking.paymentTerms && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Payment Terms</p>
                          <p className="text-sm text-gray-600 mt-1">{selectedBooking.paymentTerms}</p>
                        </div>
                      )}
                      
                      {selectedBooking.cancellationPolicy && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Cancellation Policy</p>
                          <p className="text-sm text-gray-600 mt-1">{selectedBooking.cancellationPolicy}</p>
                        </div>
                      )}
                      
                      {selectedBooking.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Additional Notes</p>
                          <p className="text-sm text-gray-600 mt-1">{selectedBooking.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setEditingBooking(selectedBooking);
                  setShowBookingDetails(false);
                  setShowForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Booking</span>
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would generate and download a contract
                  alert('Contract would be generated and downloaded');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download Contract</span>
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would send an email to the contact person
                  alert('Email would be sent to ' + selectedBooking.contactEmail);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </button>
              
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this group booking?')) {
                      updateGroupBooking(selectedBooking.id, { status: 'cancelled' });
                      setSelectedBooking({
                        ...selectedBooking,
                        status: 'cancelled'
                      });
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Booking</span>
                </button>
              )}
              
              {selectedBooking.status === 'cancelled' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reactivate this group booking?')) {
                      updateGroupBooking(selectedBooking.id, { status: 'inquiry' });
                      setSelectedBooking({
                        ...selectedBooking,
                        status: 'inquiry'
                      });
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Reactivate Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Bookings</h1>
          <p className="text-gray-600 mt-2">Manage group reservations, blocks, and corporate bookings</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Group Booking</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search group bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="inquiry">Inquiry</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.groupName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.contactPerson}</div>
                      <div className="text-sm text-gray-500">{booking.contactEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.totalRooms} rooms</div>
                      <div className="text-xs text-gray-500">
                        {booking.roomsBlocked.length} blocked, {booking.roomsBooked.length} booked
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.blockCode || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBooking(booking);
                            setShowForm(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this group booking?')) {
                              deleteGroupBooking(booking.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No group bookings found</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {groupBookings.length === 0 
                        ? "Get started by creating your first group booking" 
                        : "No bookings match your current filters"}
                    </p>
                    {groupBookings.length === 0 && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Group Booking</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <BookingForm />}
      {showBookingDetails && <BookingDetails />}
    </div>
  );
}