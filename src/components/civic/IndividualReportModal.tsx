import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Detection } from '@/types/civic';
import { MapPin, Clock, Target, User, Camera, Eye, X } from 'lucide-react';

interface IndividualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Detection | null;
  onViewStreetView: (lat: number, lng: number, reportId: string) => void;
  reportLocation?: string;
}

export const IndividualReportModal: React.FC<IndividualReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onViewStreetView,
  reportLocation
}) => {
  if (!report) return null;

  const getDetectionTypeLabel = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return 'Litter/Trash';
      case 'graffiti':
        return 'Graffiti';
      case 'infrastructure':
        return 'Infrastructure Issue';
      default:
        return type;
    }
  };

  const getDetectionColor = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return 'bg-red-500';
      case 'graffiti':
        return 'bg-orange-500';
      case 'infrastructure':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDetectionIcon = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return '🗑️';
      case 'graffiti':
        return '🎨';
      case 'infrastructure':
        return '🏗️';
      default:
        return '📍';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${getDetectionColor(report.type)} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                {getDetectionIcon(report.type)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-civic-navy">
                  Report #{report.id.slice(-4).toUpperCase()}
                </h2>
                <Badge variant="outline" className="mt-1">
                  {getDetectionTypeLabel(report.type)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover-lift-modern"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-civic-navy" />
              <span className="font-semibold text-civic-navy">Incident Details</span>
            </div>
            <p className="text-gray-700">
              {report.description}
            </p>
          </div>

          {/* Location and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">Location</span>
              </div>
              <p className="text-sm text-gray-600">
                {reportLocation || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">Reported</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatTimestamp(report.timestamp)}
              </p>
            </div>
          </div>

          {/* Confidence and Reporter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">Confidence</span>
              </div>
              <p className={`text-sm font-medium ${getConfidenceColor(report.confidence)}`}>
                {Math.round(report.confidence * 100)}% accuracy
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">Reporter</span>
              </div>
              <p className="text-sm text-gray-600">
                Civic Monitor #{report.id.slice(-3)}
              </p>
            </div>
          </div>

          {/* Evidence Section */}
          {report.image && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">Recorded Evidence</span>
              </div>
              <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
                <span className="ml-3 text-gray-500">Video Evidence Available</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onViewStreetView(report.location.lat, report.location.lng, report.id)}
              className="flex-1 bg-civic-navy text-white hover:bg-civic-blue-light transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Street View
            </Button>
            <Button
              onClick={() => {
                console.log('Opening report recording:', report.id);
              }}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Camera className="h-4 w-4" />
              View Recording
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};