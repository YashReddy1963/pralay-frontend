import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Send, 
  X, 
  Phone, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface TakeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  reportDescription: string;
  reportLocation: string;
}

interface TeamMember {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  designation: string;
  district: string;
  village: string;
}

const TakeActionModal: React.FC<TakeActionModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  reportDescription,
  reportLocation
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load team members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const loadTeamMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await apiService.makeRequest<{
        success: boolean;
        team_members: TeamMember[];
        count: number;
      }>('/api/take-action/team-members/', {
        method: 'GET',
      });
      
      if (response.success) {
        setTeamMembers(response.team_members);
      } else {
        toast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast.success('Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast.success('Recording paused');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Recording completed');
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast.error('Please record a voice message first');
      return;
    }

    if (teamMembers.length === 0) {
      toast.error('No team members found to notify');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('report_id', reportId);
      formData.append('audio_file', audioBlob, 'voice_message.wav');

      const response = await apiService.makeRequest<{
        success: boolean;
        message: string;
        data: {
          report_id: string;
          report_title: string;
          audio_file_url: string;
          team_members_count: number;
          call_results: any[];
          email_results: any[];
          successful_calls: number;
          successful_emails: number;
          action_taken_at: string;
        };
      }>('/api/take-action/', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        toast.success(response.message);
        
        // Show detailed results
        const { successful_calls, successful_emails, team_members_count } = response.data;
        toast.success(
          `Action completed! Calls: ${successful_calls}/${team_members_count}, Emails: ${successful_emails}/${team_members_count}`,
          { duration: 5000 }
        );
        
        onClose();
      } else {
        toast.error(response.message || 'Failed to take action');
      }
    } catch (error) {
      console.error('Error submitting action:', error);
      toast.error('Failed to submit action. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Take Action - Emergency Response
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{reportTitle}</h3>
              <p className="text-sm text-muted-foreground mb-2">{reportDescription}</p>
              <Badge variant="outline" className="text-xs">
                📍 {reportLocation}
              </Badge>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Team Members ({teamMembers.length})
              </h3>
              
              {loadingMembers ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  Loading team members...
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-muted-foreground ml-2">({member.designation})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone_number}
                        <Mail className="h-3 w-3 ml-2" />
                        {member.email}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members found</p>
              )}
            </CardContent>
          </Card>

          {/* Voice Recording */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Record Voice Message
              </h3>

              <div className="space-y-4">
                {/* Recording Controls */}
                <div className="flex items-center gap-4">
                  {!isRecording && !audioBlob && (
                    <Button onClick={startRecording} className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <>
                      <Button 
                        onClick={pauseRecording} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Stop Recording
                      </Button>
                    </>
                  )}

                  {audioBlob && (
                    <>
                      <Button onClick={playRecording} variant="outline" className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Play
                      </Button>
                      <Button onClick={startRecording} variant="outline" className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Record Again
                      </Button>
                    </>
                  )}
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className="font-medium">
                      {isPaused ? 'Recording Paused' : 'Recording...'} - {formatDuration(recordingDuration)}
                    </span>
                  </div>
                )}

                {/* Audio Player */}
                {audioUrl && (
                  <div className="space-y-2">
                    <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatDuration(recordingDuration)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!audioBlob || isSubmitting || teamMembers.length === 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to All Team Members
                </>
              )}
            </Button>
          </div>

          {/* Info Text */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">What happens when you click "Send":</p>
            <ul className="space-y-1">
              <li>• Voice message will be played to all team members via phone calls</li>
              <li>• Email notifications will be sent with report details</li>
              <li>• Action will be logged for audit purposes</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TakeActionModal;
