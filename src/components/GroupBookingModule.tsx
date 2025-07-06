import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHotel } from '../context/HotelContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { GroupBookingForm } from './GroupBookingForm';
import { 
  Users, 
  Calendar, 
  Building, 
  DollarSign, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  X, 
  Clock,
  Mail,
  Phone,
  AlertCircle,
  Download,
  Printer,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { GroupBooking } from '../types';

interface GroupBookingModuleProps {
  onClose?: () => void;
}

export function GroupBookingModule({ onClose }: GroupBookingModuleProps) {
  const { t } = useTranslation();
  const { groupBookings, deleteGroupBooking, rooms, bookings } = useHotel();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingGroupBooking, setEditingGroupBooking] = useState<GroupBooking | null>(null);
  const [selectedGroupBooking, setSelectedGroupBooking] = useState<GroupBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'last6months' | 'all'>('last6months');

  // Filter group bookings based on search, status, and date
  const filteredGroupBookings = groupBookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.blockCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    // Date filtering
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = checkInDate >= now;
    } else if (dateFilter === 'past') {
      matchesDate = checkInDate < now;
    } else if (dateFilter === 'last6months') {
      matchesDate = checkInDate >= sixMonthsAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: GroupBooking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: GroupBooking['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'inquiry': return <Clock className="w-4 h-4" />;
      case 'quoted': return <DollarSign className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateBookingStats = () => {
    const totalGroups = groupBookings.length;
    const confirmedGroups = groupBookings.filter(b => b.status === 'confirmed').length;
    const totalRooms = groupBookings.reduce((sum, b) => sum + (b.totalRooms || 0), 0);
    const totalRevenue = groupBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    return { totalGroups, confirmedGroups, totalRooms, totalRevenue };
  };

  const stats = calculateBookingStats();

  const GroupBookingDetails = () => {
    if (!selectedGroupBooking) return null;

    // Calculate nights
    const checkInDate = new Date(selectedGroupBooking.checkIn);
    const checkOutDate = new Date(selectedGroupBooking.checkOut);
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get room details for blocked rooms
    const blockedRoomDetails = selectedGroupBooking.roomsBlocked.map(roomId => {
      const room = rooms.find(r => r.id === roomId);
      return room ? { id: roomId, number: room.number, type: room.type } : null;
    }).filter(Boolean);

    // Get booking details for booked rooms
    const bookedRoomDetails = selectedGroupBooking.roomsBooked.map(roomId => {
      const room = rooms.find(r => r.id === roomId);
      const booking = bookings.find(b => b.roomId === roomId && b.groupBookingId === selectedGroupBooking.id);
      return room && booking ? { 
        id: roomId, 
        number: room.number, 
        type: room.type,
        guestId: booking.guestId,
        status: booking.status
      } : null;
    }).filter(Boolean);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedGroupBooking.groupName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(selectedGroupBooking.status)}`}>
                    {getStatusIcon(selectedGroupBooking.status)}
                    <span className="capitalize">{selectedGroupBooking.status}</span>
                  </span>
                  <span className="text-sm text-gray-500">Block Code: {selectedGroupBooking.blockCode}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setEditingGroupBooking(selectedGroupBooking);
                    setShowDetails(false);
                    setShowForm(true);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Group Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.basicInformation')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.checkIn')}</p>
                      <p className="font-medium">{new Date(selectedGroupBooking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.checkOut')}</p>
                      <p className="font-medium">{new Date(selectedGroupBooking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.nights')}</p>
                      <p className="font-medium">{nights}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.totalRooms')}</p>
                      <p className="font-medium">{selectedGroupBooking.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.specialRate')}</p>
                      <p className="font-medium">{formatCurrency(selectedGroupBooking.specialRates || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('groupBooking.totalAmount')}</p>
                      <p className="font-medium">{formatCurrency(selectedGroupBooking.totalAmount || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.contactInformation')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('groupBooking.contactPerson')}</p>
                        <p className="font-medium">{selectedGroupBooking.contactPerson}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('groupBooking.contactEmail')}</p>
                        <p className="font-medium">{selectedGroupBooking.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{t('groupBooking.contactPhone')}</p>
                        <p className="font-medium">{selectedGroupBooking.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rooms */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.rooms')}</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">{t('groupBooking.blockedRooms')}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {blockedRoomDetails.map((room: any) => (
                          <div key={room.id} className="p-2 border border-gray-200 rounded-lg bg-white">
                            <p className="font-medium">Room {room.number}</p>
                            <p className="text-xs text-gray-500 capitalize">{room.type}</p>
                          </div>
                        ))}
                        
                        {blockedRoomDetails.length === 0 && (
                          <p className="text-sm text-gray-500 col-span-full">{t('groupBooking.noRoomsBlocked')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">{t('groupBooking.bookedRooms')}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {bookedRoomDetails.map((room: any) => (
                          <div key={room.id} className="p-2 border border-gray-200 rounded-lg bg-white">
                            <p className="font-medium">Room {room.number}</p>
                            <p className="text-xs text-gray-500 capitalize">{room.type}</p>
                          </div>
                        ))}
                        
                        {bookedRoomDetails.length === 0 && (
                          <p className="text-sm text-gray-500 col-span-full">{t('groupBooking.noRoomsBooked')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-6">
                {/* Payment Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.paymentInformation')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('groupBooking.paymentStatus')}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedGroupBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedGroupBooking.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedGroupBooking.paymentStatus || 'pending'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('groupBooking.depositAmount')}</span>
                      <span className="font-medium">
                        {selectedGroupBooking.depositAmount 
                          ? formatCurrency(selectedGroupBooking.depositAmount) 
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('groupBooking.depositPaid')}</span>
                      <span className="font-medium">
                        {selectedGroupBooking.depositPaid ? t('common.yes') : t('common.no')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{t('groupBooking.depositDate')}</span>
                      <span className="font-medium">
                        {selectedGroupBooking.depositDate 
                          ? new Date(selectedGroupBooking.depositDate).toLocaleDateString() 
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.additionalServices')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedGroupBooking.meetingRoomsRequired ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {selectedGroupBooking.meetingRoomsRequired 
                          ? <Check className="w-3 h-3 text-green-600" /> 
                          : <X className="w-3 h-3 text-gray-400" />}
                      </div>
                      <span className="text-sm">{t('groupBooking.meetingRooms')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedGroupBooking.cateringRequired ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {selectedGroupBooking.cateringRequired 
                          ? <Check className="w-3 h-3 text-green-600" /> 
                          : <X className="w-3 h-3 text-gray-400" />}
                      </div>
                      <span className="text-sm">{t('groupBooking.catering')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedGroupBooking.transportationRequired ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {selectedGroupBooking.transportationRequired 
                          ? <Check className="w-3 h-3 text-green-600" /> 
                          : <X className="w-3 h-3 text-gray-400" />}
                      </div>
                      <span className="text-sm">{t('groupBooking.transportation')}</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.includedAmenities')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupBooking.amenitiesIncluded?.map((amenity) => (
                      <span key={amenity} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                    
                    {(!selectedGroupBooking.amenitiesIncluded || selectedGroupBooking.amenitiesIncluded.length === 0) && (
                      <p className="text-sm text-gray-500">{t('groupBooking.noAmenities')}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedGroupBooking.notes && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.notes')}</h4>
                    <p className="text-sm text-gray-700">{selectedGroupBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Policies */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('groupBooking.termsAndPolicies')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">{t('groupBooking.contractTerms')}</h5>
                  <p className="text-sm text-gray-700">{selectedGroupBooking.contractTerms || t('groupBooking.noTerms')}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">{t('groupBooking.paymentTerms')}</h5>
                  <p className="text-sm text-gray-700">{selectedGroupBooking.paymentTerms || t('groupBooking.noTerms')}</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">{t('groupBooking.cancellationPolicy')}</h5>
                  <p className="text-sm text-gray-700">{selectedGroupBooking.cancellationPolicy || t('groupBooking.noPolicy')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  // In a real app, this would generate and download a PDF
                  alert('Contract would be downloaded in a real application');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>{t('groupBooking.downloadContract')}</span>
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would print the contract
                  alert('Contract would be printed in a real application');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Printer className="w-4 h-4" />
                <span>{t('groupBooking.printContract')}</span>
              </button>
              
              <button
                onClick={() => {
                  // In a real app, this would send an email to the contact person
                  alert('Email would be sent in a real application');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Mail className="w-4 h-4" />
                <span>{t('groupBooking.emailContact')}</span>
              </button>
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
          <h1 className="text-3xl font-bold text-gray-900">{t('groupBooking.groupBookings')}</h1>
          <p className="text-gray-600 mt-2">{t('groupBooking.manageGroupBookings')}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setEditingGroupBooking(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>{t('groupBooking.newGroupBooking')}</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('groupBooking.totalGroups')}</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalGroups}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('groupBooking.confirmedGroups')}</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmedGroups}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('groupBooking.totalRooms')}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('groupBooking.totalRevenue')}</p>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
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
                placeholder={t('groupBooking.searchGroups')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('groupBooking.allStatuses')}</option>
              <option value="inquiry">{t('groupBooking.inquiry')}</option>
              <option value="quoted">{t('groupBooking.quoted')}</option>
              <option value="confirmed">{t('groupBooking.confirmed')}</option>
              <option value="cancelled">{t('groupBooking.cancelled')}</option>
            </select>
          </div>
          
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{t('groupBooking.allDates')}</option>
              <option value="upcoming">{t('groupBooking.upcoming')}</option>
              <option value="past">{t('groupBooking.past')}</option>
              <option value="last6months">{t('groupBooking.last6Months')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.groupName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.contact')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.dates')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.rooms')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('groupBooking.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroupBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{booking.groupName}</div>
                        <div className="text-xs text-gray-500">#{booking.blockCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.contactPerson}</div>
                    <div className="text-xs text-gray-500">{booking.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(booking.checkOut).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.totalRooms} rooms</div>
                    <div className="text-xs text-gray-500">{booking.roomsBooked.length} booked</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.totalAmount ? formatCurrency(booking.totalAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGroupBooking(booking);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroupBooking(booking);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('groupBooking.confirmDelete'))) {
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
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredGroupBookings.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('groupBooking.noGroupBookings')}</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">{t('groupBooking.noGroupBookingsDescription')}</p>
            <button
              onClick={() => {
                setEditingGroupBooking(null);
                setShowForm(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>{t('groupBooking.createFirstGroupBooking')}</span>
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <GroupBookingForm 
          onClose={() => setShowForm(false)} 
          editingGroupBooking={editingGroupBooking || undefined}
        />
      )}
      
      {showDetails && selectedGroupBooking && <GroupBookingDetails />}
    </div>
  );
}