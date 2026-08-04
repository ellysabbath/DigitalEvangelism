// src/pages/admin/ViewStudent.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUserGraduate, FaEnvelope, FaPhone, FaAward, FaChartBar, FaClock, FaCheckCircle, FaUsers, FaEdit, FaPrint, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ViewStudent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const student = {
    id: id,
    name: 'Alice Mwangi',
    email: 'alice@student.com',
    phone: '+254 712 345 678',
    group: 'Youth Discipleship',
    evangelist: 'Mary Wanjiru',
    examsCompleted: 8,
    certificates: 2,
    status: 'active',
    joinedDate: '2026-01-10',
    recentExams: [
      { title: 'The Power of Prayer', score: 85, date: '2026-01-15' },
      { title: 'Faith in Action', score: 92, date: '2026-01-12' },
      { title: 'Walking in Love', score: 78, date: '2026-01-10' },
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Student report downloaded!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 hover:bg-cyan-50 rounded-lg transition-colors group"
            title="Back to Students"
          >
            <FaArrowLeft className="text-gray-500 group-hover:text-cyan-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-sm text-gray-600">View student details and progress</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Print Profile"
          >
            <FaPrint />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Download Report"
          >
            <FaDownload />
          </button>
          <button 
            onClick={() => navigate(`/admin/students/edit/${student.id}`)}
            className="p-2 text-gray-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50"
            title="Edit Student"
          >
            <FaEdit />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Section */}
        <div className="p-6 bg-gradient-to-r from-cyan-50 to-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-cyan-100 rounded-full">
              <FaUserGraduate className="text-4xl text-cyan-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  student.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : student.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center">
                  <FaEnvelope className="mr-2 text-cyan-500" /> {student.email}
                </span>
                <span className="flex items-center">
                  <FaPhone className="mr-2 text-cyan-500" /> {student.phone}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-2 text-cyan-500" /> Joined: {new Date(student.joinedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500">
              <p className="text-sm text-gray-600">Group</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUsers className="mr-2 text-cyan-500" />
                {student.group}
              </p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-500">
              <p className="text-sm text-gray-600">Evangelist</p>
              <p className="text-lg font-semibold text-gray-900">{student.evangelist}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Exams Completed</p>
              <p className="text-lg font-semibold text-green-600">{student.examsCompleted}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600">Certificates</p>
              <p className="text-lg font-semibold text-yellow-600">{student.certificates}</p>
            </div>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaChartBar className="mr-2 text-cyan-500" />
              Recent Exam Results
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {student.recentExams.length} exams
            </span>
          </div>
          <div className="space-y-3">
            {student.recentExams.map((exam, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-cyan-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">{exam.title}</p>
                  <p className="text-xs text-gray-500">{exam.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold ${getScoreColor(exam.score)}`}>
                    {exam.score}%
                  </span>
                  {exam.score >= 80 && <FaCheckCircle className="text-green-500" />}
                  {exam.score >= 60 && exam.score < 80 && <FaCheckCircle className="text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Performance Summary */}
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Performance Summary</p>
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Average Score:</strong> 85%
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="text-gray-900">Exams Passed:</strong> 3 of 3
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-xs text-gray-500">Average</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">100%</p>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;