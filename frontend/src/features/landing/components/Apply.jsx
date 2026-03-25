import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Upload, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const Input = ({ placeholder, ...props }) => (
  <div className="relative group">
     <input 
        className="skeuo-node w-full p-5 md:p-6 bg-white border-2 border-transparent focus:border-indigo-600 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest placeholder:text-gray-300 focus:outline-none"
        placeholder={placeholder}
        {...props}
     />
  </div>
);

const Apply = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        campus: '',
    });
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Registry Sync Complete: Application submitted to the EDUVERSE Sync Registry.');
        }, 1500);
    };


    return (
        <section id="apply" className="py-24 md:py-48 px-4 md:px-6 lg:px-20 bg-white relative overflow-hidden">
            
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-32">
                
                {/* TOP/LEFT SIDE: REGISTRY CONTENT */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex-1 space-y-8 md:space-y-12"
                >
                    <div className="flex flex-col">
                        <span className="text-indigo-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6">
                            Join the Network
                        </span>
                        <h2 className="text-3xl md:text-8xl font-black tracking-tighter uppercase text-black leading-[0.9] mb-6 md:mb-8">
                           Sync Your <br />
                           <span className="text-3d italic font-light text-gray-300">Journey</span> Now.
                        </h2>
                    </div>
                    
                    <div className="flex flex-col gap-6 md:gap-12">
                        <div className="flex items-start gap-4 md:gap-6">
                            <div className="skeuo-node w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white shadow-lg border-2 border-white flex-shrink-0">
                                <ShieldCheck className="text-indigo-600" size={20} md:size={24} />
                            </div>
                            <div>
                                <h4 className="text-base md:text-lg font-black uppercase tracking-tighter mb-1 md:mb-2 text-black">Verified Onboarding</h4>
                                <p className="text-xs md:text-sm font-medium text-gray-400 font-manrope leading-relaxed">
                                   Your profile will be encrypted and synchronized across the university ledger.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-black">
                           <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Registrations Open Fall 2026
                           </div>
                        </div>
                    </div>
                </motion.div>

                {/* BOTTOM/RIGHT: CLAYMOBPHISM FORM CARD */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, amount: 0.1 }}
                    className="flex-1 w-full max-w-xl"
                >
                    <div className="clay-card p-6 md:p-14 border-[8px] md:border-[12px] border-white shadow-2xl relative">
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-8 md:mb-12 text-center text-black">Join Us</h3>
                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                                <Input 
                                    placeholder="First Name" 
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                                <Input 
                                    placeholder="Last Name" 
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                            </div>
                            <Input 
                                placeholder="Email Address" 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input 
                                placeholder="College / Institution" 
                                value={formData.campus}
                                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                            />
                            
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    id="resume" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx"
                                />
                                <label 
                                    htmlFor="resume" 
                                    className="skeuo-node w-full flex items-center justify-center gap-3 md:gap-4 p-5 md:p-6 bg-white border-2 border-dashed border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer text-gray-400 group-hover:text-black shadow-inner"
                                >
                                    {fileName ? (
                                        <>
                                            <CheckCircle className="text-indigo-600" size={18} />
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate max-w-[150px] md:max-w-[200px] text-black">
                                                {fileName}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Attach Resume</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <button 
                                disabled={loading}
                                type="submit"
                                className={`skeuo-node w-full py-5 md:py-6 text-white font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-4 border-none shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ background: '#000000', color: '#FFFFFF', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Submit Application <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Apply;
