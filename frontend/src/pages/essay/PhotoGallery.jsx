import React from 'react';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

export default function PhotoGallery({ images, uploading, handleUploadImage, handleDeleteImage, handleCaptionChange, saveCaption, isEditing }) {
    return (
        <section style={{ pageBreakInside: 'avoid' }}>
            <div className="flex justify-between border-b border-slate-200 pb-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={16} /> Galería Fotográfica
                </h3>
                {isEditing && (
                    <label className="cursor-pointer bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded flex gap-2 hover:bg-blue-700 transition active:scale-95 shadow-sm">
                        <Upload size={14} /> Subir
                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                    </label>
                )}
            </div>
            {!images.length ? (
                <div className="p-8 border border-dashed text-center text-slate-400 text-sm italic">
                    No se han registrado fotografías para este ensayo todavía.
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="bg-white border border-slate-200 group relative" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <div className="overflow-hidden bg-slate-100 relative" style={{ height: '180px' }}>
                                <img src={img.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" crossOrigin="anonymous" />
                                {isEditing && (
                                    <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded shadow hover:bg-red-700 transition">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="p-2">
                                {isEditing ? (
                                    <input type="text" value={img.caption || ''} onChange={(e) => handleCaptionChange(img.id, e.target.value)} onBlur={(e) => saveCaption(img.id, e.target.value)} className="w-full text-xs font-bold border-b outline-none focus:border-blue-400 py-1" />
                                ) : (
                                    <p className="text-xs font-bold text-slate-700 truncate">{img.caption || 'Sin título'}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
