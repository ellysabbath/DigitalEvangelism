// src/pages/Certificates.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaAward, FaSearch, FaDownload, FaShare, 
  FaEye, FaCheckCircle, FaClock, FaPrint,
  FaCertificate, FaQrcode, FaPlus, FaTimes,
  FaUserGraduate, FaLemon, FaCalendarAlt, FaIdCard,
  FaUser, FaEnvelope, FaPhone, FaChurch, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../auth/context/AuthContext';
import {QRCodeSVG} from 'qrcode.react';
import toast from 'react-hot-toast';

interface Certificate {
  id: string;
  title: string;
  studentName: string;
  studentId: string;
  sermonTitle: string;
  issuedDate: string;
  certificateNumber: string;
  grade: string;
  status: 'issued' | 'pending' | 'expired';
  qrCode: string;
  studentEmail?: string;
  studentPhone?: string;
  churchName?: string;
  region?: string;
}

interface NewCertificate {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  churchName: string;
  region: string;
  sermonId: string;
  grade: string;
  issueDate: string;
}

const Certificates: React.FC = () => {
  const { user, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCertificate, setNewCertificate] = useState<NewCertificate>({
    studentId: '',
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    churchName: '',
    region: '',
    sermonId: '',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'Certificate of Completion - The Power of Faith',
      studentName: 'Sarah Johnson',
      studentId: 'STU-001',
      sermonTitle: 'The Power of Faith',
      issuedDate: '2026-01-20',
      certificateNumber: 'DES-2026-001',
      grade: 'B',
      status: 'issued',
      qrCode: 'https://example.com/cert/1',
      studentEmail: 'sarah@example.com',
      studentPhone: '+254 712 345 678',
      churchName: 'City Light Church',
      region: 'Central Region',
    },
    {
      id: '2',
      title: 'Certificate of Excellence - Walking in Love',
      studentName: 'Michael Kim',
      studentId: 'STU-002',
      sermonTitle: 'Walking in Love',
      issuedDate: '2026-01-18',
      certificateNumber: 'DES-2026-002',
      grade: 'A',
      status: 'issued',
      qrCode: 'https://example.com/cert/2',
      studentEmail: 'michael@example.com',
      studentPhone: '+254 723 456 789',
      churchName: 'Grace Assembly',
      region: 'Eastern Region',
    },
    {
      id: '3',
      title: 'Certificate of Completion - Spiritual Growth',
      studentName: 'Grace Mwangi',
      studentId: 'STU-003',
      sermonTitle: 'Spiritual Growth',
      issuedDate: '2026-01-15',
      certificateNumber: 'DES-2026-003',
      grade: 'C',
      status: 'pending',
      qrCode: 'https://example.com/cert/3',
      studentEmail: 'grace@example.com',
      studentPhone: '+254 734 567 890',
      churchName: 'Faith Ministry',
      region: 'Western Region',
    },
  ];

  // Available sermons for dropdown (mock data)
  const availableSermons = [
    { id: '1', title: 'The Power of Faith' },
    { id: '2', title: 'Walking in Love' },
    { id: '3', title: 'Spiritual Growth' },
    { id: '4', title: 'Grace and Mercy' },
    { id: '5', title: 'The Holy Spirit' },
  ];

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.sermonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || cert.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'issued':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'issued':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCertificate.studentName || !newCertificate.sermonId || !newCertificate.grade) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sermon = availableSermons.find(s => s.id === newCertificate.sermonId);
      
      toast.success(`Certificate created successfully for ${newCertificate.studentName}!`);
      setShowCreateModal(false);
      setNewCertificate({
        studentId: '',
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        churchName: '',
        region: '',
        sermonId: '',
        grade: '',
        issueDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error('Failed to create certificate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewCertificate({
      ...newCertificate,
      [e.target.name]: e.target.value,
    });
  };

  const handleIssueCertificate = (id: string) => {
    toast.success('Certificate issued successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Certificates
          </h1>
          <p className="mt-1 text-gray-600">
            {userRole === 'admin' ? 'Manage, issue and generate certificates' : 'Your earned certificates'}
          </p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <FaPlus />
            <span>Issue Certificate</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <FaCertificate className="text-cyan-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'issued').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, sermon, certificate number or student ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-cyan-500">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaAward className="text-yellow-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {cert.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(cert.status)} inline-flex items-center space-x-1`}>
                    {getStatusIcon(cert.status)}
                    <span>{cert.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Student:</span> {cert.studentName}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Student ID:</span> {cert.studentId}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Sermon:</span> {cert.sermonTitle}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Certificate #:</span> {cert.certificateNumber}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Date:</span> {new Date(cert.issuedDate).toLocaleDateString()}
              </p>
              {cert.grade && (
                <p className="text-gray-600">
                  <span className="font-medium">Grade:</span> {cert.grade}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedCertificate(cert)}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1"
              >
                <FaEye className="text-xs" />
                <span>View</span>
              </button>
              <div className="flex space-x-2">
                {cert.status === 'issued' && (
                  <>
                    <button className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
                      <FaDownload />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
                      <FaPrint />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50">
                      <FaShare />
                    </button>
                  </>
                )}
                {cert.status === 'pending' && userRole === 'admin' && (
                  <button 
                    onClick={() => handleIssueCertificate(cert.id)}
                    className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Issue Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaAward className="text-4xl text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Complete exams to earn certificates'}
          </p>
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <FaPlus className="mr-2" />
              Issue your first certificate
            </button>
          )}
        </div>
      )}

      {/* View Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Certificate Details</h3>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 rounded-xl p-6 text-white text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full">
                    <FaAward className="text-4xl" />
                  </div>
                </div>
                <h4 className="text-2xl font-serif font-bold">{selectedCertificate.title}</h4>
                <p className="text-cyan-100 mt-2">Certificate #{selectedCertificate.certificateNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sermon</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.sermonTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className="font-medium text-gray-900">{selectedCertificate.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getStatusColor(selectedCertificate.status)}`}>
                    {getStatusIcon(selectedCertificate.status)}
                    <span>{selectedCertificate.status}</span>
                  </span>
                </div>
              </div>

              {/* Student Contact Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Student Contact Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedCertificate.studentEmail && (
                    <p className="text-gray-600"><span className="font-medium">Email:</span> {selectedCertificate.studentEmail}</p>
                  )}
                  {selectedCertificate.studentPhone && (
                    <p className="text-gray-600"><span className="font-medium">Phone:</span> {selectedCertificate.studentPhone}</p>
                  )}
                  {selectedCertificate.churchName && (
                    <p className="text-gray-600"><span className="font-medium">Church:</span> {selectedCertificate.churchName}</p>
                  )}
                  {selectedCertificate.region && (
                    <p className="text-gray-600"><span className="font-medium">Region:</span> {selectedCertificate.region}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t border-gray-200">
                <div className="text-center">
                  <QRCodeSVG 
                    value={selectedCertificate.qrCode}
                    size={120}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                {selectedCertificate.status === 'issued' && (
                  <>
                    <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                      <FaDownload />
                      <span>Download</span>
                    </button>
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <FaPrint />
                      <span>Print</span>
                    </button>
                  </>
                )}
                {selectedCertificate.status === 'pending' && userRole === 'admin' && (
                  <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all">
                    Issue Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Issue Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <FaCertificate className="text-cyan-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Issue Certificate</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4">
              {/* Student Information Section */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaUserGraduate className="mr-2 text-cyan-500" />
                  Student Information
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={newCertificate.studentName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter student full name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={newCertificate.studentId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="e.g., STU-001"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaEnvelope className="mr-2 text-cyan-500" />
                  Contact Information
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="studentEmail"
                        name="studentEmail"
                        value={newCertificate.studentEmail}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="student@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="studentPhone"
                        name="studentPhone"
                        value={newCertificate.studentPhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="+254 712 345 678"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Church Information Section */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaChurch className="mr-2 text-cyan-500" />
                  Church Information
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                      Church Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaChurch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="churchName"
                        name="churchName"
                        value={newCertificate.churchName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter church name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="region"
                        name="region"
                        value={newCertificate.region}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter region"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Details Section */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaCertificate className="mr-2 text-cyan-500" />
                  Certificate Details
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="sermonId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Sermon <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLemon className="text-gray-400" />
                      </div>
                      <select
                        id="sermonId"
                        name="sermonId"
                        value={newCertificate.sermonId}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select a sermon</option>
                        {availableSermons.map(sermon => (
                          <option key={sermon.id} value={sermon.id}>
                            {sermon.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="text-gray-400" />
                      </div>
                      <select
                        id="grade"
                        name="grade"
                        value={newCertificate.grade}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900 appearance-none"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select grade</option>
                        <option value="A">A - Excellent</option>
                        <option value="B">B - Very Good</option>
                        <option value="C">C - Good</option>
                        <option value="D">D - Satisfactory</option>
                        <option value="F">F - Fail</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="issueDate"
                        name="issueDate"
                        value={newCertificate.issueDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-gray-900"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Issuing...
                    </>
                  ) : (
                    <>
                      <FaCertificate className="mr-2" />
                      Issue Certificate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-2">
                Certificate will be generated with a unique QR code for verification
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;