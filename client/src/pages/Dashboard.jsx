import { FilePenLineIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloudIcon, XIcon, UploadCloud, LoaderCircleIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyResumeData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth)

  const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']
  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate()

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', {
        headers: { Authorization: token }
      });
      setAllResumes(data.resumes || []);
    } catch (error) {
      console.log("Error loading resumes:", error);
    }
  };

  const createResume = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.post(
        '/api/resumes/create',
        { title },
        { headers: { Authorization: token } }
      );
      setAllResumes([...allResumes, data.resume]);
      setTitle('');
      setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    
    if (!resume) {
      toast.error("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: token }});
      
      setTitle('');
      setResume(null);
      setShowUploadResume(false);
      toast.success("Resume uploaded successfully!");
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(error?.response?.data?.message || "Failed to process resume");
    } finally {
      setIsLoading(false);
    }
  };

const editTitle = async (event) => {
  try {
    event.preventDefault();

    const { data } = await api.put(
      `/api/resumes/update`,
      { resumeId: editResumeId, resumeData: { title } },
      { headers: { Authorization: token } }
    );

    setAllResumes(
      allResumes.map(resume =>
        resume._id === editResumeId ? { ...resume, title } : resume
      )
    );

    setTitle('');
    setEditResumeId('');
    toast.success(data.message);

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  }
};


const deleteResume = async (resumeId) => {
  try {
    const confirm = window.confirm('Are you sure you want to delete this resume?')
    if (confirm) {
      const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: token }
      })
      setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
      toast.success(data.message)
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
  }
}


  useEffect(() => {
    loadAllResumes()
  }, [])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name || "User"}
        </p>

        {/* --- ACTION BUTTONS --- */}
        <div className='flex gap-4'>
          <button
            onClick={() => setShowCreateResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Upload Existing</p>
          </button>
        </div>

        <hr className='border-slate-300 my-6 sm:w-[305px]' />

        {/* --- RESUME LIST --- */}
        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length]

            return (
              <button
                key={index}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: baseColor + '40'
                }}
              >
                <FilePenLineIcon
                  className="size-7 group-hover:scale-105 transition-all"
                  style={{ color: baseColor }}
                />

                <p
                  className='text-sm group-hover:scale-105 transition-all px-2 text-center truncate w-full'
                  style={{ color: baseColor }}
                >
                  {resume.title}
                </p>

                <p
                  className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center'
                  style={{ color: baseColor + '90' }}
                >
                  {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Just now'}
                </p>

                <div onClick={e => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden bg-white/50 rounded-md'>
                  <PencilIcon
                    onClick={() => { setEditResumeId(resume._id); setTitle(resume.title) }}
                    className="size-7 p-1.5 hover:bg-white rounded text-slate-700 transition-colors"
                  />
                  <TrashIcon
                    onClick={() => deleteResume(resume._id)}
                    className="size-7 p-1.5 hover:bg-red-100 hover:text-red-600 rounded text-slate-700 transition-colors"
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* --- CREATE MODAL --- */}
        {showCreateResume && (
          <form
            onSubmit={createResume}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          >
            <div className='relative bg-white border shadow-xl rounded-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200'>
              <h2 className='text-xl font-bold mb-4 text-slate-800'>Create a Resume</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder='Enter resume title'
                className='w-full px-4 py-2 mb-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                required
              />

              <button className='w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors active:scale-[0.98]'>
                Create Resume
              </button>

              <XIcon
                className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors bg-slate-100 rounded-full p-1 size-7'
                onClick={() => {
                  setShowCreateResume(false)
                  setTitle('')
                }}
              />
            </div>
            {/* Background click to close */}
            <div className="absolute inset-0 -z-10" onClick={() => setShowCreateResume(false)}></div>
          </form>
        )}

        {/* --- UPLOAD MODAL --- */}
        {showUploadResume && (
          <form
            onSubmit={uploadResume}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          >
            <div className='relative bg-white border shadow-xl rounded-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200'>
              <h2 className='text-xl font-bold mb-4 text-slate-800'>Upload Resume</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder='Enter resume title'
                className='w-full px-4 py-2 mb-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                required
              />

              <div className="mb-6">
                <label htmlFor="resume-input" className="block text-sm font-medium text-slate-700 mb-2">
                  Select resume file (PDF)
                </label>
                <div className='relative'>
                    <input
                        type="file"
                        id="resume-input"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setResume(e.target.files[0])}
                    />
                    <label 
                        htmlFor="resume-input"
                        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-300
                        ${resume 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-slate-300 hover:border-green-400 hover:bg-slate-50'
                        }`}
                    >
                        {resume ? (
                            <>
                                <div className="p-3 bg-green-100 rounded-full text-green-600">
                                    <FilePenLineIcon className="size-6" />
                                </div>
                                <p className='text-sm text-green-700 font-medium text-center truncate w-full px-2'>
                                    {resume.name}
                                </p>
                                <span className="text-xs text-green-600">Click to change file</span>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-slate-100 rounded-full text-slate-500 group-hover:text-green-600 transition-colors">
                                    <UploadCloud className='size-8' />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-600">Click to upload</p>
                                    <p className="text-xs text-slate-400 mt-1">PDF format only</p>
                                </div>
                            </>
                        )}
                    </label>
                </div>
              </div>

              {/* FIXED BUTTON LOGIC */}
              <button 
                disabled={isLoading}
                type="submit" 
                className={`w-full py-3 rounded-lg font-medium text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]
                  ${isLoading 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
              >
                {isLoading ? (
                  <>
                    <LoaderCircleIcon className="animate-spin size-5 text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Upload & AI Parse</span>
                )}
              </button>

              <XIcon
                className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors bg-slate-100 rounded-full p-1 size-7'
                onClick={() => { setShowUploadResume(false); setTitle(''); setResume(null); }}
              />
            </div>
            {/* Background click to close */}
            <div className="absolute inset-0 -z-10" onClick={() => !isLoading && setShowUploadResume(false)}></div>
          </form>
        )}

        {/* --- EDIT TITLE MODAL --- */}
        {editResumeId && (
          <form
            onSubmit={editTitle}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          >
            <div className='relative bg-white border shadow-xl rounded-xl w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4 text-slate-800'>Edit Title</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                className='w-full px-4 py-2 mb-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                required
              />

              <button className='w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors'>
                Update Title
              </button>

              <XIcon
                className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors bg-slate-100 rounded-full p-1 size-7'
                onClick={() => { setEditResumeId(''); setTitle(''); }}
              />
            </div>
            <div className="absolute inset-0 -z-10" onClick={() => { setEditResumeId(''); setTitle(''); }}></div>
          </form>
        )}

      </div>
    </div>
  )
}

export default Dashboard