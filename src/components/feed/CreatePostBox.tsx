import React, { useState } from 'react';
import { 
  Image, BarChart2, Smile, MapPin, Globe, Users, Lock, 
  Sparkles, X, Plus, Trash2, Send 
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const CreatePostBox: React.FC = () => {
  const { currentUser, addPost } = useSocial();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showPollInput, setShowPollInput] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [audience, setAudience] = useState<'public' | 'friends' | 'only_me'>('public');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Feeling state
  const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(null);

  const sampleImagePresets = [
    { label: 'Scenic Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Synth Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Architecture', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80' }
  ];

  const feelingsList = [
    { emoji: '✨', label: 'inspired' },
    { emoji: '🚀', label: 'productive' },
    { emoji: '🎉', label: 'celebrating' },
    { emoji: '☕', label: 'caffeinated' },
    { emoji: '🏔️', label: 'adventurous' },
    { emoji: '💡', label: 'creative' },
    { emoji: '🎧', label: 'in the zone' }
  ];

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions(prev => [...prev, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    setPollOptions(prev => prev.map((opt, i) => i === index ? val : opt));
  };

  const handleReset = () => {
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
    setShowPollInput(false);
    setShowFeelingPicker(false);
    setShowLocationInput(false);
    setLocation('');
    setSelectedFeeling(null);
    setPollQuestion('');
    setPollOptions(['', '']);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !showPollInput) return;

    let pollData = undefined;
    if (showPollInput && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      pollData = {
        question: pollQuestion.trim(),
        options: pollOptions.filter(o => o.trim()).map((optText, idx) => ({
          id: `opt-${Date.now()}-${idx}`,
          text: optText.trim(),
          votes: 0,
          voters: []
        })),
        totalVotes: 0
      };
    }

    addPost({
      author: currentUser,
      content: content.trim(),
      image: imageUrl.trim() || undefined,
      feeling: selectedFeeling || undefined,
      location: location.trim() || undefined,
      audience,
      poll: pollData
    });

    handleReset();
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-6 transition-all">
      {/* Top Prompt Row */}
      <div className="flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-[#F7F9FC] hover:bg-[#EEF2F6] border border-slate-200/80 hover:border-slate-300 rounded-full py-2.5 px-4 text-left text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          What's on your mind, {currentUser.name.split(' ')[0]}?
        </button>
      </div>

      {/* Quick Action Triggers */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-slate-600">
        <button
          onClick={() => {
            setIsOpen(true);
            setShowImageInput(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F0F4F8] text-xs font-bold text-[#00D68F] transition-colors cursor-pointer"
        >
          <Image className="w-4 h-4" />
          <span className="hidden sm:inline">Photo</span>
        </button>

        <button
          onClick={() => {
            setIsOpen(true);
            setShowPollInput(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F0F4F8] text-xs font-bold text-[#3366FF] transition-colors cursor-pointer"
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Poll</span>
        </button>

        <button
          onClick={() => {
            setIsOpen(true);
            setShowFeelingPicker(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F0F4F8] text-xs font-bold text-[#FFAB00] transition-colors cursor-pointer"
        >
          <Smile className="w-4 h-4" />
          <span className="hidden sm:inline">Feeling</span>
        </button>

        <button
          onClick={() => {
            setIsOpen(true);
            setShowLocationInput(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:bg-[#F0F4F8] text-xs font-bold text-[#FF3D71] transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Location</span>
        </button>
      </div>

      {/* Create Post Dialog / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Post</h3>
              <button
                onClick={handleReset}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#F0F4F8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Author & Privacy Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                      {selectedFeeling && (
                        <span className="text-xs text-slate-600 font-normal">
                          is {selectedFeeling.emoji} {selectedFeeling.label}
                        </span>
                      )}
                    </div>
                    {location && (
                      <span className="text-[11px] text-[#FF3D71] block font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Audience Selector */}
                <div className="relative">
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="bg-[#F0F4F8] border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#FF3D71] font-semibold cursor-pointer"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="friends">👥 Friends</option>
                    <option value="only_me">🔒 Only Me</option>
                  </select>
                </div>
              </div>

              {/* Main Text Field */}
              <textarea
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}? Share thoughts, links, or updates...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF3D71] resize-none"
                autoFocus
              />

              {/* Image Input Section */}
              {showImageInput && (
                <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-[#00D68F]" />
                      Attach Image
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        setImageUrl('');
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                  />

                  {/* Preset photo tags */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-1">Or choose a curated photo:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {sampleImagePresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className="h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-[#FF3D71] relative group cursor-pointer"
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                            <span className="text-[10px] font-bold text-white text-center">{preset.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Poll Input Section */}
              {showPollInput && (
                <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-[#3366FF]" />
                      Create a Community Poll
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPollInput(false);
                        setPollQuestion('');
                        setPollOptions(['', '']);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Poll Question (e.g., Best UI Framework?)"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71] font-semibold"
                  />

                  <div className="space-y-1.5">
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePollOption(idx)}
                            className="text-[#FF3D71] hover:text-[#d92356] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="flex items-center gap-1 text-xs text-[#3366FF] hover:text-[#254edb] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add option
                    </button>
                  )}
                </div>
              )}

              {/* Feelings Picker */}
              {showFeelingPicker && (
                <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">How are you feeling?</span>
                    <button type="button" onClick={() => setShowFeelingPicker(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {feelingsList.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedFeeling(selectedFeeling?.label === f.label ? null : f);
                          setShowFeelingPicker(false);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          selectedFeeling?.label === f.label
                            ? 'bg-[#FFF0F4] border-[#FF3D71] text-[#FF3D71]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-[#F0F4F8]'
                        }`}
                      >
                        <span>{f.emoji}</span>
                        <span className="capitalize">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Input */}
              {showLocationInput && (
                <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">Add Location</span>
                    <button type="button" onClick={() => setShowLocationInput(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, Tokyo, Swiss Alps..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#FF3D71]"
                  />
                </div>
              )}

              {/* Add-on Toolbar */}
              <div className="p-2.5 rounded-xl bg-[#F0F4F8] border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Add to your post</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(true)}
                    className="p-1.5 rounded-lg text-[#00D68F] hover:bg-white transition-colors"
                    title="Add Photo"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPollInput(true)}
                    className="p-1.5 rounded-lg text-[#3366FF] hover:bg-white transition-colors"
                    title="Add Poll"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeelingPicker(true)}
                    className="p-1.5 rounded-lg text-[#FFAB00] hover:bg-white transition-colors"
                    title="Add Feeling"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLocationInput(true)}
                    className="p-1.5 rounded-lg text-[#FF3D71] hover:bg-white transition-colors"
                    title="Add Location"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#F0F4F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() && !imageUrl && !pollQuestion.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#FF3D71] to-[#FF5C8A] hover:from-[#e62e60] hover:to-[#ff3d71] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
