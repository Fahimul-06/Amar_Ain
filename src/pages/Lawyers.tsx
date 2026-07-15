import { useEffect, useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, BadgeCheck } from 'lucide-react';
import { supabase, type Lawyer, type LawyerCategory, type Profile } from '../lib/supabase';
import { Avatar, Stars, Badge, formatBDT, EmptyState } from '../components/ui';

type LawyerRow = Lawyer & {
  lawyer_categories?: LawyerCategory | null;
  profiles?: Profile | null;
};

const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla'];
const LANGUAGES = ['Bangla', 'English', 'Hindi', 'Arabic'];

export function LawyersPage({ navigate, initialCategory }: { navigate: (to: string) => void; initialCategory?: string }) {
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [categories, setCategories] = useState<LawyerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(initialCategory || 'all');
  const [city, setCity] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [minRating, setMinRating] = useState(0);
  const [maxFee, setMaxFee] = useState(10000);
  const [sort, setSort] = useState<'rating' | 'fee_low' | 'fee_high' | 'experience'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: raw }] = await Promise.all([
        supabase.from('lawyer_categories').select('*').order('name'),
        supabase
          .from('lawyers')
          .select('*, lawyer_categories(*), profiles!inner(*)')
          .eq('status', 'verified'),
      ]);
      setCategories((cats as LawyerCategory[]) || []);
      setLawyers((raw as LawyerRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...lawyers];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.profiles?.full_name?.toLowerCase().includes(q) ||
          l.lawyer_categories?.name?.toLowerCase().includes(q) ||
          l.bar_id?.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') list = list.filter((l) => l.lawyer_categories?.id === category);
    if (city !== 'all') list = list.filter((l) => l.profiles?.location?.toLowerCase().includes(city.toLowerCase()));
    if (language !== 'all') list = list.filter((l) => l.languages?.includes(language));
    if (minRating > 0) list = list.filter((l) => l.rating >= minRating);
    list = list.filter((l) => Number(l.consultation_fee) <= maxFee);
    list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'fee_low') return Number(a.consultation_fee) - Number(b.consultation_fee);
      if (sort === 'fee_high') return Number(b.consultation_fee) - Number(a.consultation_fee);
      return b.experience_years - a.experience_years;
    });
    return list;
  }, [lawyers, search, category, city, language, minRating, maxFee, sort]);

  return (
    <div className="bg-ink-50">
      {/* Search header */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-ink-900">Find a verified lawyer</h1>
          <p className="mt-1 text-sm text-ink-500">Browse {lawyers.length} verified lawyers across Bangladesh.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or bar ID..."
                className="input pl-10"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-outline">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input sm:w-48">
              <option value="rating">Top rated</option>
              <option value="fee_low">Fee: low to high</option>
              <option value="fee_high">Fee: high to low</option>
              <option value="experience">Most experienced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card sticky top-20 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-ink-900">Filters</h3>
                <button
                  onClick={() => {
                    setCategory('all');
                    setCity('all');
                    setLanguage('all');
                    setMinRating(0);
                    setMaxFee(10000);
                  }}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-900"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                    <option value="all">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                    <option value="all">All cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                    <option value="all">Any language</option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Minimum rating</label>
                  <div className="flex gap-1.5">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                          minRating === r ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-ink-200 text-ink-600'
                        }`}
                      >
                        {r === 0 ? 'Any' : `${r}+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Max fee: {formatBDT(maxFee)}</label>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-full accent-gold-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-ink-500">
                {filtered.length} lawyer{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card h-56 p-5">
                    <div className="skeleton mb-3 h-16 w-16 rounded-full" />
                    <div className="skeleton mb-2 h-4 w-2/3 rounded" />
                    <div className="skeleton mb-4 h-3 w-1/2 rounded" />
                    <div className="skeleton h-8 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Search size={22} />}
                title="No lawyers match your filters"
                description="Try widening your search or resetting filters."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/lawyers/${l.id}`)}
                    className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar name={l.profiles?.full_name || 'Lawyer'} url={l.profiles?.avatar_url} size={56} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate font-display text-base font-bold text-ink-900">
                            {l.profiles?.full_name || 'Unknown'}
                          </h3>
                          {l.bar_council_verified && <BadgeCheck size={16} className="shrink-0 text-emerald-600" />}
                        </div>
                        <p className="text-sm text-ink-500">{l.lawyer_categories?.name || 'General Practice'}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                          <span className="flex items-center gap-1">
                            <Stars rating={l.rating} size={12} /> {l.rating.toFixed(1)} ({l.rating_count})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {l.profiles?.location || 'Bangladesh'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(l.consultation_fee))}</div>
                        <div className="text-[11px] text-ink-400">per session</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{l.experience_years} yrs exp</Badge>
                      {l.languages?.slice(0, 2).map((lng) => (
                        <Badge key={lng} tone="blue">
                          {lng}
                        </Badge>
                      ))}
                      <Badge tone="gold">{l.bar_id || 'Bar ID'}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
