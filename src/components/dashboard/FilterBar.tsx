import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dateRangeOptions, platformFilterOptions } from '@/lib/mockData';
import { loadCategories, loadIntents, type QueryCategory, type QueryIntent } from '@/lib/services/queryStorage';

interface FilterBarProps {
  showPlatformFilter?: boolean;
  selectedCategory?: string;
  selectedIntent?: string;
  onCategoryChange?: (categoryId: string | null) => void;
  onIntentChange?: (intentId: string | null) => void;
}

export function FilterBar({ 
  showPlatformFilter = true,
  selectedCategory,
  selectedIntent,
  onCategoryChange,
  onIntentChange,
}: FilterBarProps) {
  const [categories, setCategories] = useState<QueryCategory[]>([]);
  const [intents, setIntents] = useState<QueryIntent[]>([]);

  useEffect(() => {
    setCategories(loadCategories());
    setIntents(loadIntents());
    
    const handleUpdate = () => {
      setCategories(loadCategories());
      setIntents(loadIntents());
    };
    
    window.addEventListener('categoriesUpdated', handleUpdate);
    window.addEventListener('intentsUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleUpdate);
      window.removeEventListener('intentsUpdated', handleUpdate);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select defaultValue="30d">
        <SelectTrigger className="w-[160px] bg-card border-border">
          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showPlatformFilter && (
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {platformFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onCategoryChange && (
        <Select
          value={selectedCategory || '__all__'}
          onValueChange={(value) => onCategoryChange(value === '__all__' ? null : value)}
        >
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name || 'Unknown'
                : 'All Categories'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {onIntentChange && (
        <Select
          value={selectedIntent || '__all__'}
          onValueChange={(value) => onIntentChange(value === '__all__' ? null : value)}
        >
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Intent">
              {selectedIntent 
                ? intents.find(i => i.id === selectedIntent)?.name || 'Unknown'
                : 'All Intents'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Intents</SelectItem>
            {intents.map((intent) => (
              <SelectItem key={intent.id} value={intent.id}>
                {intent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
