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
  const [editingStudent, setEditingStudent] = useState(null); // null means adding
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

  const openEmailModal = (student) => {
    setEmailStudent(student);
    setEmailSubject(`Update regarding ${student.name}`);
    setEmailBody(`Dear ${student.parentName},\n\nWe wanted to share a quick update from Little Sprouts Kindergarten regarding ${student.name}.\n\nBest regards,\nLittle Sprouts Administration`);
    setEmailSuccess('');
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[SIMULATED EMAIL] To: ${emailStudent.parentEmail}, Subject: ${emailSubject}, Body: ${emailBody}`);
    setEmailSending(false);
    setEmailSuccess('Simulated email notification sent successfully!');
    setTimeout(() => {
      setEmailStudent(null);
      setEmailSuccess('');
    }, 2000);
  };


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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingStudent) {
        // Edit student
        const updated = await dbService.updateStudent(editingStudent.id, formData);
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
      } else {
        // Add student
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

  // Filter & Search logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentPhone.includes(searchTerm);
    
    const matchesClass = selectedClass === 'All' || student.classGroup === selectedClass;

    return matchesSearch && matchesClass;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout currentTab="students">
      <div className="flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Management</h1>
            <p className="text-slate-400 text-sm mt-1">Manage enrollments, group classes, and contact lists ({students.length} students enrolled).</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 py-3 px-5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/20 w-fit"
          >
            <Plus className="h-5 w-5" />
            Add New Student
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, parent, phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            >
              <option value="All">All Classes</option>
              <option value="Toddlers">Toddlers (2-3 yrs)</option>
              <option value="Pre-K">Pre-K (4-5 yrs)</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800/80">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mb-4"></div>
              <p className="text-slate-400 text-sm">Fetching student roster...</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-500 mb-4">
                <Info className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-white">No Students Found</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-md">Try adjusting your search query, selecting another class filter, or add a new student enrollment record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/55 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Class Group</th>
                    <th className="py-4 px-6">Parent Info</th>
                    <th className="py-4 px-6">Emergency Contact</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white text-base">{student.name}</p>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            DOB: {student.birthDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          student.classGroup === 'Pre-K' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                        }`}>
                          {student.classGroup}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            {student.parentName}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {student.parentPhone}
                          </p>
                          {student.parentEmail && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate max-w-[200px]">
                              <Mail className="h-3.5 w-3.5 text-slate-500" />
                              {student.parentEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-slate-300 max-w-[200px] truncate" title={student.emergencyContact}>
                          {student.emergencyContact}
                        </p>
                        {student.address && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate max-w-[200px]">
                            <MapPin className="h-3.5 w-3.5 text-slate-600" />
                            {student.address}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.parentEmail && (
                            <button
                              onClick={() => openEmailModal(student)}
                              className="p-2 text-brand-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
                              title="Send Email to Parent"
                            >
                              <Mail className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
                            title="Edit Student"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-2 text-red-400 hover:text-red-300 bg-red-950/10 border border-red-900/30 hover:border-red-900/80 rounded-xl transition-all"
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
            <p className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold text-white">
                {Math.min(indexOfLastItem, filteredStudents.length)}
              </span>{' '}
              of <span className="font-semibold text-white">{filteredStudents.length}</span> students
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-800 bg-slate-900 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-800 bg-slate-900 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT STUDENT SLIDE DRAWER / MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-8 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 flex-1">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Student Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Liam Miller"
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                    formErrors.name ? 'border-red-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Birth Date *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                      formErrors.birthDate ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.birthDate && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.birthDate}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Class Group *</label>
                  <select
                    name="classGroup"
                    value={formData.classGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  >
                    <option value="Toddlers">Toddlers</option>
                    <option value="Pre-K">Pre-K</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Parent/Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sarah Miller"
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                    formErrors.parentName ? 'border-red-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.parentName && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.parentName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Parent Phone *</label>
                  <input
                    type="text"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 555-0199"
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                      formErrors.parentPhone ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.parentPhone && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.parentPhone}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. parent@example.com"
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                      formErrors.parentEmail ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.parentEmail && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.parentEmail}</p>}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Emergency Contact details *</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="e.g. Father Name - 555-0100"
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                    formErrors.emergencyContact ? 'border-red-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.emergencyContact && <p className="text-red-400 text-xs mt-1.5 font-medium">{formErrors.emergencyContact}</p>}
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">Residential Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Oak St, Springfield"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <div className="pt-6 border-t border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-scale-up">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Student Enrollment?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete the student enrollment record for{' '}
              <strong className="text-white">{studentToDelete.name}</strong>? This action will remove their profile and is irreversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL SIMULATION DIALOG */}
      {emailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-400" />
                Email Parent: {emailStudent.parentName}
              </h3>
              <button
                onClick={() => setEmailStudent(null)}
                className="text-slate-400 hover:text-white"
                disabled={emailSending}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {emailSuccess ? (
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold rounded-xl flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 shrink-0" />
                {emailSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-1">To</label>
                  <input
                    type="text"
                    disabled
                    value={`${emailStudent.parentName} <${emailStudent.parentEmail}>`}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={emailSending}
                    placeholder="Subject line"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-355 text-xs font-semibold mb-1">Message Body</label>
                  <textarea
                    rows="6"
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    disabled={emailSending}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailStudent(null)}
                    disabled={emailSending}
                    className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
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
