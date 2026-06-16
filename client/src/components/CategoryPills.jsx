import {
  Globe,
  Paintbrush,
  TrendingUp,
  FileText,
  Clapperboard,
  Palette,
  Search,
  Smartphone,
} from 'lucide-react';

const categories = [
  { label: 'All', icon: null },
  { label: 'Web Development', icon: Globe },
  { label: 'Logo Design', icon: Paintbrush },
  { label: 'Digital Marketing', icon: TrendingUp },
  { label: 'Content Writing', icon: FileText },
  { label: 'Video Editing', icon: Clapperboard },
  { label: 'UI/UX Design', icon: Palette },
  { label: 'SEO', icon: Search },
  { label: 'Mobile Apps', icon: Smartphone },
];

const CategoryPills = ({ selected, onSelect }) => {
  const mapLabel = (label) => {
    if (label === 'Mobile Apps') return 'Mobile Development';
    return label === 'All' ? '' : label;
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = (cat.label === 'All' && !selected) || selected === mapLabel(cat.label);
        return (
          <button
            key={cat.label}
            onClick={() => onSelect(mapLabel(cat.label))}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {Icon && <Icon size={16} />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
