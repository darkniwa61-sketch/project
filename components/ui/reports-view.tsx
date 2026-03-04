'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  PackagePlus, 
  PackageMinus, 
  Edit2, 
  LogIn, 
  Search, 
  ArrowDownUp, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { LogEvent } from '@/components/providers/activity-provider';

const tabs = [
  { id: 'added', name: 'Stock Added', icon: PackagePlus, type: 'add' },
  { id: 'removed', name: 'Stock Removed', icon: PackageMinus, type: 'delete' },
  { id: 'edits', name: 'Product Edits', icon: Edit2, type: 'update' },
  // { id: 'logins', name: 'Login History', icon: LogIn, type: 'login' }, // Leaving this defined but omitting mapping for now, assuming auth logging is separate
];

const ITEMS_PER_PAGE = 5;

// Helper to format timestamps back to date strings for the table
function formatTimestamp(ts: number) {
  const dateObj = new Date(ts);
  return {
    date: dateObj.toLocaleDateString(),
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function ReportsView() {
  const [activeTab, setActiveTab] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportData, setReportData] = useState<LogEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch all activity logs
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('time', { ascending: false });
        
      if (data) setReportData(data as LogEvent[]);
      if (error) console.error("Error fetching reports:", error);
    };

    fetchReports();

    // 2. Listen for new logs
    const channel = supabase
      .channel('reports_page_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload) => {
          setReportData((prev) => [payload.new as LogEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filter and sort the data base on active state
  const filteredData = useMemo(() => {
    let result = reportData.filter(item => item.type === activeTab);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.user.toLowerCase().includes(q) || 
          item.item.toLowerCase().includes(q) || 
          item.action.toLowerCase().includes(q) ||
          (item.details && item.details.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      return sortOrder === 'newest' ? b.time - a.time : a.time - b.time;
    });

    return result;
  }, [reportData, activeTab, searchQuery, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedData = filteredData.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tabType: string) => {
    setActiveTab(tabType);
    setCurrentPage(1); // Reset page on tab change
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e7e5e4] pb-px overflow-x-auto scbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.type
                ? 'border-[#c26941] text-[#2d2621] bg-white rounded-t-md border-t border-l border-r border-t-[#e7e5e4] border-l-[#e7e5e4] border-r-[#e7e5e4] -mb-px'
                : 'border-transparent text-[#78716c] hover:text-[#2d2621] hover:border-[#e7e5e4] rounded-t-md'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search by user, product, or action..." 
            className="pl-9 w-full bg-white border-[#e7e5e4] focus-visible:ring-[#c26941]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
          />
        </div>

        <button 
          onClick={toggleSort}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e7e5e4] text-[#2d2621] rounded-md text-sm font-medium hover:bg-[#f5f5f4] transition-colors shrink-0"
        >
          <ArrowDownUp className="w-4 h-4" />
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#fafafa] border-b border-[#e7e5e4] text-[#78716c] font-medium">
              <tr>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e5e4]">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const { date, time } = formatTimestamp(row.time);
                  return (
                    <tr key={row.id} className="hover:bg-[#fafafa]/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#2d2621]">{date}</p>
                        <p className="text-xs text-[#78716c] mt-0.5">{time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#2d2621]">{row.user}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          row.type === 'add' ? 'bg-green-100 text-green-700' :
                          row.type === 'delete' ? 'bg-red-100 text-red-700' :
                          row.type === 'update' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#2d2621]">{row.item}</td>
                      <td className="px-6 py-4 text-[#78716c] text-xs max-w-xs truncate" title={row.details}>
                        {row.details || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#78716c]">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination overflow handling */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e7e5e4] bg-white">
          <p className="text-sm text-[#78716c]">
            Showing {(validCurrentPage - 1) * ITEMS_PER_PAGE + (filteredData.length > 0 ? 1 : 0)} to {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validCurrentPage === 1}
              className="p-2 rounded hover:bg-[#f5f5f4] text-[#78716c] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 rounded bg-[#c26941] text-white text-sm font-medium">
              {validCurrentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="p-2 rounded hover:bg-[#f5f5f4] text-[#2d2621] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
