import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Detection } from '@/types/civic';
import { MapPin, Clock, Target, User, Camera } from 'lucide-react';

interface HeatmapReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Detection[];
  location: { lat: number; lng: number } | null;
  category: string;
}

export const HeatmapReportsModal: React.FC<HeatmapReportsModalProps> = ({
  isOpen,
  onClose,
  reports,
  location,
  category
}) => {
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categoryConfig = {
    trash: { name: 'Litter/Trash', icon: '🗑️', color: 'border-red-200 bg-red-50' },
    graffiti: { name: 'Graffiti', icon: '🎨', color: 'border-orange-200 bg-orange-50' },
    infrastructure: { name: 'Infrastructure', icon: '🏗️', color: 'border-yellow-200 bg-yellow-50' },
    road_blocked: { name: 'Road Blocked', icon: '🚧', color: 'border-purple-200 bg-purple-50' }
  };

  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.trash;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-civic-navy">
                {config.name} Reports
              </h2>
              {location && (
                <p className="text-sm text-muted-foreground">
                  Near {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className={`p-4 rounded-lg border-2 ${config.color} mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-civic-navy" />
              <span className="font-semibold text-civic-navy">
                {reports.length === 1 ? 'Individual Report' : `${reports.length} Reports in Area`}
              </span>
            </div>
            <Badge variant="outline" className="bg-white">
              {reports.length === 1 ? 'Single Report' : 'Area Analysis'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {reports.length === 1 
              ? 'Detailed view of the selected civic issue report.'
              : 'Click on any report below to view full details and recorded footage.'
            }
          </p>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4 pr-4">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reports found in this area</p>
                <p className="text-sm">Try clicking on a different heatmap hotspot</p>
              </div>
            ) : (
              reports.map((report, index) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // This would normally open the specific report details
                    console.log('Opening report:', report.id);
                  }}
                >
                  <div className="flex gap-4">
                    {/* Report Type Icon */}
                    <div className={`w-12 h-12 rounded-full ${getDetectionColor(report.type)} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                      {getDetectionIcon(report.type)}
                    </div>

                    {/* Report Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {getDetectionTypeLabel(report.type)}
                          </Badge>
                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            Report #{report.id.slice(-4).toUpperCase()}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(report.timestamp)}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">
                              {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-500">
                              Reporter #{1000 + index}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.image && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Camera className="h-3 w-3" />
                              <span>Photo</span>
                            </div>
                          )}
                          <span className={`font-medium ${getConfidenceColor(report.confidence)}`}>
                            {Math.round(report.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Preview Image */}
                  {report.image && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Recorded Evidence</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {reports.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Click any report to view recorded footage and full details</span>
              <span>{reports.length} total {reports.length === 1 ? 'report' : 'reports'}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};