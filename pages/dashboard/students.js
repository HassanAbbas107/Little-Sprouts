import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { dbService } from '../../lib/db';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    emergencyContact: '',
    classGroup: 'Toddlers'
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Email modal state
  const [emailStudent, setEmailStudent] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  // Load students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await dbService.getStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Student name is required';
    if (!formData.birthDate) errors.birthDate = 'Birth date is required';
    if (!formData.parentName.trim()) errors.parentName = 'Parent/Guardian name is required';
    if (!formData.parentPhone.trim()) {
      errors.parentPhone = 'Parent phone is required';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.parentPhone.trim())) {
      errors.parentPhone = 'Invalid phone number format';
    }
    if (formData.parentEmail.trim() && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      errors.parentEmail = 'Invalid email address';
    }
    if (!formData.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      birthDate: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      emergencyContact: '',
      classGroup: 'Toddlers'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      birthDate: student.birthDate || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      address: student.address || '',
      emergencyContact: student.emergencyContact || '',
      classGroup: student.classGroup || 'Toddlers'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEmailModal = (student) => {
    setEmailStudent(student);
    setEmailSubject(`School Update: ${student.name}`);
    setEmailBody(`Dear ${student.parentName},\n\nWe wanted to share a quick update from Little Sprouts Kindergarten regarding ${student.name}.\n\nBest regards,\nLittle Sprouts Administration`);
    setEmailSuccess('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingStudent) {
        const updated = await dbService.updateStudent(editingStudent.id, formData);
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
      } else {
        const added = await dbService.addStudent(formData);
        setStudents(prev => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error saving student record.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await dbService.deleteStudent(studentToDelete.id);
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete student.');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[SIMULATED EMAIL] To: ${emailStudent.parentEmail}, Subject: ${emailSubject}, Body: ${emailBody}`);
    setEmailSending(false);
    setEmailSuccess('Simulated email notification sent successfully!');
    setTimeout(() => {
      setEmailStudent(null);
      setEmailSuccess('');
    }, 2000);
  };

  // Filter & Search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentPhone.includes(searchTerm);
    
    const matchesClass = selectedClass === 'All' || student.classGroup === selectedClass;

    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout currentTab="students">
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Students Roster</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage student profiles, enrollments, and parent contact logs.</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 py-3 px-5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-sky-500/20 w-fit"
          >
            <Plus className="h-5 w-5" />
            Add New Student
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, parent, phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-all font-medium text-sm"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 focus:outline-none focus:border-sky-400 transition-all font-bold text-sm"
            >
              <option value="All">All Classes</option>
              <option value="Toddlers">Toddlers (2-3 yrs)</option>
              <option value="Pre-K">Pre-K (4-5 yrs)</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="school-panel rounded-3xl overflow-hidden bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500 mb-4"></div>
              <p className="text-slate-500 text-sm font-semibold">Fetching student profiles...</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-full text-slate-400 mb-4">
                <Info className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Students Found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md font-medium">Try adjusting your search filters or add a new record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Class Group</th>
                    <th className="py-4 px-6">Parent Info</th>
                    <th className="py-4 px-6">Emergency Contact</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-800 text-base">{student.name}</p>
                          <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            DOB: {student.birthDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          student.classGroup === 'Pre-K' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-sky-50 text-sky-600 border border-sky-100'
                        }`}>
                          {student.classGroup}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {student.parentName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {student.parentPhone}
                          </p>
                          {student.parentEmail && (
                            <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 truncate max-w-[200px]">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {student.parentEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-semibold text-slate-650 max-w-[200px] truncate" title={student.emergencyContact}>
                          {student.emergencyContact}
                        </p>
                        {student.address && (
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1 truncate max-w-[200px]">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {student.address}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.parentEmail && (
                            <button
                              onClick={() => openEmailModal(student)}
                              className="p-2 text-sky-500 hover:text-sky-600 bg-sky-50 border border-sky-100 rounded-xl transition-all"
                              title="Send Email to Parent"
                            >
                              <Mail className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-100 rounded-xl transition-all"
                            title="Edit Student"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-2 text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 rounded-xl transition-all"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {!loading && filteredStudents.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
            <p className="text-sm text-slate-500 font-bold">
              Showing <span className="font-extrabold text-slate-800">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-extrabold text-slate-800">
                {Math.min(indexOfLastItem, filteredStudents.length)}
              </span>{' '}
              of <span className="font-extrabold text-slate-800">{filteredStudents.length}</span> students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-slate-100 bg-white rounded-xl text-sm font-bold text-slate-650 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-slate-100 bg-white rounded-xl text-sm font-bold text-slate-650 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT STUDENT SLIDE DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col p-8 overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-50 pb-5 mb-6">
              <h2 className="text-xl font-extrabold text-slate-850">
                {editingStudent ? `Edit Profile: ${editingStudent.name}` : 'Enroll New Student'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 flex-1 text-slate-700">
              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Student Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Liam Miller"
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                    formErrors.name ? 'border-rose-400' : 'border-slate-100'
                  }`}
                />
                {formErrors.name && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">Birth Date *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                      formErrors.birthDate ? 'border-rose-400' : 'border-slate-100'
                    }`}
                  />
                  {formErrors.birthDate && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.birthDate}</p>}
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">Class Group *</label>
                  <select
                    name="classGroup"
                    value={formData.classGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-bold text-sm"
                  >
                    <option value="Toddlers">Toddlers</option>
                    <option value="Pre-K">Pre-K</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sarah Miller"
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                    formErrors.parentName ? 'border-rose-400' : 'border-slate-100'
                  }`}
                />
                {formErrors.parentName && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.parentName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">Parent Phone *</label>
                  <input
                    type="text"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 555-0199"
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                      formErrors.parentPhone ? 'border-rose-400' : 'border-slate-100'
                    }`}
                  />
                  {formErrors.parentPhone && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.parentPhone}</p>}
                </div>
                <div>
                  <label className="block text-slate-600 text-sm font-bold mb-2">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. parent@example.com"
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                      formErrors.parentEmail ? 'border-rose-400' : 'border-slate-100'
                    }`}
                  />
                  {formErrors.parentEmail && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.parentEmail}</p>}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Emergency Contact details *</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="e.g. Father Name - 555-0100"
                  className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm ${
                    formErrors.emergencyContact ? 'border-rose-400' : 'border-slate-100'
                  }`}
                />
                {formErrors.emergencyContact && <p className="text-rose-600 text-xs mt-1.5 font-bold">{formErrors.emergencyContact}</p>}
              </div>

              <div>
                <label className="block text-slate-600 text-sm font-bold mb-2">Residential Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Oak St, Springfield"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-105 rounded-2xl text-slate-805 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="pt-6 border-t-2 border-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-500 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl shadow-md hover:shadow-sky-500/20 transition-all"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border-2 border-slate-100 rounded-3xl shadow-2xl p-6 animate-scale-up text-slate-700">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-800">Delete Student Record?</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Are you sure you want to delete the student enrollment record for{' '}
              <strong className="text-slate-800">{studentToDelete.name}</strong>? This action will permanently remove their profile.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border-2 border-slate-100 bg-white text-slate-500 hover:bg-slate-55 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL SIMULATION DIALOG */}
      {emailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border-2 border-slate-100 rounded-3xl shadow-2xl p-6 animate-scale-up text-slate-700">
            <div className="flex items-center justify-between border-b-2 border-slate-55 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-sky-500" />
                Email Parent: {emailStudent.parentName}
              </h3>
              <button
                onClick={() => setEmailStudent(null)}
                className="text-slate-400 hover:text-slate-600"
                disabled={emailSending}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {emailSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold rounded-2xl flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 shrink-0" />
                {emailSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">To</label>
                  <input
                    type="text"
                    disabled
                    value={`${emailStudent.parentName} <${emailStudent.parentEmail}>`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={emailSending}
                    placeholder="Subject line"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-sky-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold mb-1">Message Body</label>
                  <textarea
                    rows="6"
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    disabled={emailSending}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-sky-400 font-medium resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailStudent(null)}
                    disabled={emailSending}
                    className="px-4 py-2 border-2 border-slate-100 bg-white text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                  >
                    {emailSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Simulated Email'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
