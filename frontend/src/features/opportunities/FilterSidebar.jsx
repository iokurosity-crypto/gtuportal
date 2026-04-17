import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Briefcase, GraduationCap, Building2, Cpu, Globe } from 'lucide-react';
import { filterOptions } from '@/data/opportunitiesData';
import { cn } from '@/utils';

import { shortBranches } from '@/data/branches';

const FilterSection = ({ title, children, icon: Icon, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-5 last:border-0 group/section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-bold text-slate-800 mb-2 hover:text-blue-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-400 group-hover/section:text-blue-500 transition-colors" />}
          {title}
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ filters, onFilterChange }) => {

  const handleToggle = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange(key, updated);
  };

  return (
    <div className="space-y-1">
      <FilterSection title="Work Mode" icon={Globe}>
        {[
          { id: 'remote', label: 'Remote / Work from Home' },
          { id: 'hybrid', label: 'Hybrid (Office + Home)' },
          { id: 'onsite', label: 'On-site (In-office)' }
        ].map(mode => (
          <label key={mode.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.workModes || []).includes(mode.id)}
              onChange={() => handleToggle('workModes', mode.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{mode.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Employment Type" icon={Briefcase}>
        {[
          { id: 'job', label: 'Full-time Permanent' },
          { id: 'internship', label: 'Internship / Trainee' },
          { id: 'freelance', label: 'Freelance / Contract' },
          { id: 'project', label: 'Project-based Role' }
        ].map(type => (
          <label key={type.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.opportunityTypes || []).includes(type.id)}
              onChange={() => handleToggle('opportunityTypes', type.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{type.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Experience Level" icon={Cpu}>
        {[
          { id: 'entry', label: 'Entry Level (0-2 Years)' },
          { id: 'mid', label: 'Intermediate (2-5 Years)' },
          { id: 'senior', label: 'Senior (5-10 Years)' },
          { id: 'lead', label: 'Lead / Executive (10+ Years)' }
        ].map(exp => (
          <label key={exp.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.experienceLevels || []).includes(exp.id)}
              onChange={() => handleToggle('experienceLevels', exp.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{exp.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Department" icon={Building2}>
        {shortBranches.map(dept => (
          <label key={dept.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.departments || []).includes(dept.id)}
              onChange={() => handleToggle('departments', dept.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{dept.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Education" icon={GraduationCap}>
        {[
          { id: 'be_btech', label: 'B.E. / B.Tech' },
          { id: 'me_mtech', label: 'M.E. / M.Tech' },
          { id: 'mba', label: 'MBA / PGDM' },
          { id: 'mca', label: 'MCA' },
          { id: 'phd', label: 'PHD / Doctorate' }
        ].map(edu => (
          <label key={edu.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.education || []).includes(edu.id)}
              onChange={() => handleToggle('education', edu.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{edu.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Top Cities" icon={MapPin}>
        {[
          { id: 'bangalore', label: 'Bangalore / Bengaluru' },
          { id: 'hyderabad', label: 'Hyderabad / Secunderabad' },
          { id: 'pune', label: 'Pune' },
          { id: 'mumbai', label: 'Mumbai' },
          { id: 'delhi', label: 'Delhi / NCR' }
        ].map(city => (
          <label key={city.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.cities || []).includes(city.id)}
              onChange={() => handleToggle('cities', city.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{city.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Salary (LPA)">
        <div className="space-y-2">
          {['Any', 'Entry', 'Mid', 'High'].map(range => (
            <label key={range} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="salaryRange"
                checked={filters.salaryRange === range}
                onChange={() => onFilterChange('salaryRange', range)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">
                {range === 'Any' ? 'Any Salary' : range === 'Entry' ? 'Entry (0-5L)' : range === 'Mid' ? 'Mid (5-15L)' : 'High (15L+)'}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Industry" icon={Cpu}>
        {[
          { id: 'it', label: 'IT & Software' },
          { id: 'finance', label: 'Banking / Finance' },
          { id: 'healthcare', label: 'Healthcare / Pharma' },
          { id: 'edtech', label: 'Education / EdTech' },
          { id: 'ecommerce', label: 'E-commerce' }
        ].map(ind => (
          <label key={ind.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.industries || []).includes(ind.id)}
              onChange={() => handleToggle('industries', ind.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{ind.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Company Type" icon={Building2}>
        {[
          { id: 'startup', label: 'Early-stage Startup' },
          { id: 'unicorn', label: 'Unicorn / Growth' },
          { id: 'mnc', label: 'Global MNC' },
          { id: 'small_medium', label: 'SME / Local Firm' }
        ].map(ct => (
          <label key={ct.id} className="flex items-center gap-3 cursor-pointer group px-1 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={(filters.companyTypes || []).includes(ct.id)}
              onChange={() => handleToggle('companyTypes', ct.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{ct.label}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;
