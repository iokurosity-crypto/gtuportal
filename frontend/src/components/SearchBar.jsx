import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';

const SearchBar = ({ value, onChange, placeholder, className }) => {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="pl-10 h-11 bg-card border-border/60 focus-visible:ring-primary/20 rounded-xl"
            />
        </div>
    );
};

export default SearchBar;
