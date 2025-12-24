'use client';

import { useState } from 'react';
import Image from 'next/image';
import { History, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useHistory } from '@/hooks/useHistory';
import { HistoryType, HistoryItem } from '@/lib/history';
import { useLanguage } from '@/contexts/LanguageContext';

interface HistoryModalProps {
  type: HistoryType;
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: HistoryItem) => void;
}

export default function HistoryModal({
  type,
  isOpen,
  onClose,
  onSelectItem,
}: HistoryModalProps) {
  const { history, isLoading, deleteItem, clearAll } = useHistory(type);
  const { language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const handleSelectItem = (item: HistoryItem) => {
    if (onSelectItem) {
      onSelectItem(item);
      onClose();
    } else {
      setSelectedItem(item);
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(language === 'vi' ? 'Xóa mục này?' : 'Delete this item?')) {
      deleteItem(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        language === 'vi'
          ? 'Xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.'
          : 'Clear all history? This action cannot be undone.'
      )
    ) {
      clearAll();
      setSelectedItem(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTitle = () => {
    if (language === 'vi') {
      switch (type) {
        case 'scanner':
          return 'Lịch sử quét menu';
        case 'food-recognition':
          return 'Lịch sử nhận diện món ăn';
        case 'price-check':
          return 'Lịch sử kiểm tra giá';
      }
    } else {
      switch (type) {
        case 'scanner':
          return 'Menu Scan History';
        case 'food-recognition':
          return 'Food Recognition History';
        case 'price-check':
          return 'Price Check History';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {language === 'vi'
              ? 'Xem lại các kết quả đã tìm kiếm trước đó'
              : 'View your previous search results'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {history.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {language === 'vi' ? 'Xóa tất cả' : 'Clear All'}
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {!isLoading && history.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-gray-500 py-12">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {language === 'vi'
                    ? 'Chưa có lịch sử tìm kiếm'
                    : 'No search history yet'}
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={`data:image/jpeg;base64,${item.thumbnail || item.image}`}
                          alt="History item"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-3">
                          {type === 'scanner' &&
                            item.result?.dishes &&
                            `${item.result.dishes.length} ${
                              language === 'vi' ? 'món ăn' : 'dishes'
                            }`}
                          {type === 'food-recognition' &&
                            item.result?.dishName &&
                            item.result.dishName}
                          {type === 'price-check' &&
                            item.result?.total &&
                            `${item.result.total.toLocaleString()} VND`}
                        </div>
                        {item.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {item.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{formatDate(selectedItem.timestamp)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image on the left */}
                <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={`data:image/jpeg;base64,${selectedItem.image}`}
                    alt="Selected item"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Information on the right */}
                <div className="flex flex-col space-y-4 overflow-y-auto max-h-[500px]">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-sm text-gray-600">
                      {language === 'vi' ? 'Kết quả phân tích' : 'Analysis Result'}
                    </h3>
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedItem.result, null, 2)}
                    </pre>
                  </div>

                  {selectedItem.location && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-1 text-sm text-gray-600">
                        {language === 'vi' ? 'Địa điểm' : 'Location'}
                      </h3>
                      <p className="text-sm">📍 {selectedItem.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
