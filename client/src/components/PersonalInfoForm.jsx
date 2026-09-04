import React from 'react'
import { User, Mail, Phone, MapPin, BriefcaseBusiness, LinkedinIcon, Globe, Camera, Wand2 } from 'lucide-react'

const PersonalInfoForm = ({ data, onChange, removeBackground, setRemoveBackground }) => {

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value })
  }

  const fields = [
    { key: "full_name", label: "Full Name", icon: User, type: "text", required: true, placeholder: "e.g. Akshat Sharma" },
    { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text", required: false, placeholder: "e.g. Full Stack Developer" },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true, placeholder: "e.g. akshat@example.com" },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel", required: false, placeholder: "e.g. +91 9876543210" },
    { key: "location", label: "Location", icon: MapPin, type: "text", required: false, placeholder: "e.g. Mumbai, India" },
    { key: "website", label: "Portfolio / Website", icon: Globe, type: "url", required: false, placeholder: "e.g. www.akshat.dev" },
    { key: "linkedin", label: "LinkedIn Profile", icon: LinkedinIcon, type: "url", required: false, placeholder: "e.g. linkedin.com/in/akshat" },
  ]

  return (
    <div className="bg-white p-2 rounded-xl">

      <div className="mb-6">
        <h3 className='text-xl font-bold text-slate-800'>Personal Details</h3>
        <p className='text-sm text-slate-500'>Start with your basic information and contact details.</p>
      </div>

      <div className='flex flex-col sm:flex-row items-center gap-6 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        
        <div className="relative group">
          <label className="cursor-pointer block relative">
            {data.image ? (
              <div className="relative w-24 h-24">
                <img
                  src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white size-6" />
                </div>
              </div>
            ) : (
              <div className='w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm hover:bg-slate-300 transition-colors'>
                <User className='size-10 text-slate-400' />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={(e) => handleChange("image", e.target.files[0])}
            />
          </label>

          <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-200 pointer-events-none">
            <Camera className="size-3.5 text-slate-600" />
          </div>
        </div>

        <div className="flex-1 w-full text-center sm:text-left">
          <h4 className="text-sm font-semibold text-slate-700">Profile Photo</h4>
          <p className="text-xs text-slate-500 mb-3">Upload a professional headshot (JPG/PNG)</p>

          {data.image && (
            <div
              onClick={() => setRemoveBackground(!removeBackground)}
              className={`inline-flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-300 select-none
                ${removeBackground ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${removeBackground ? 'bg-green-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full shadow-sm transition-transform duration-300 ${removeBackground ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>

              <div className="flex items-center gap-1.5">
                <Wand2 className={`size-3.5 ${removeBackground ? 'text-green-600 fill-green-100' : 'text-slate-500'}`} />
                <span className={`text-xs font-medium ${removeBackground ? 'text-green-700' : 'text-slate-600'}`}>
                  Remove Background
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ❗ All input fields now full width, stacked vertically */}
      <div className='grid grid-cols-1 gap-5'>
        {fields.map((field) => {
          const Icon = field.icon
          return (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                  <Icon className="size-4" />
                </div>

                <input
                  type={field.type}
                  value={data[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className='w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 
                  focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-slate-400'
                />
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default PersonalInfoForm
