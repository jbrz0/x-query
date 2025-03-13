'use client'

import { useState, KeyboardEvent } from 'react'
// removed useEffect 
import {
  MagnifyingGlassIcon,
  HashtagIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ArrowPathRoundedSquareIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  TrashIcon,
  ChevronUpDownIcon
} from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface PhraseGroup {
  phrases: string[]
  useAllWords: boolean
}

interface QueryState {
  phraseGroups: PhraseGroup[]
  excludedPhrases: string[]
  filterRetweets: boolean
  filterReplies: boolean
  filterLinks: boolean
  filterImages: boolean
  filterVideos: boolean
  minLikes: number
  minRetweets: number
  minReplies: number
  fromUser: string
  toUser: string
  mentionUser: string
  location: string
  locationRadius: number
  language: string
  urlDomain: string
  listName: string
  since: Date | null
  until: Date | null
}

const LANGUAGES = [
  { name: 'Arabic', code: 'ar' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Danish', code: 'da' },
  { name: 'Dutch', code: 'nl' },
  { name: 'English', code: 'en' },
  { name: 'Finnish', code: 'fi' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Polish', code: 'pl' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' },
  { name: 'Spanish', code: 'es' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Thai', code: 'th' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Vietnamese', code: 'vi' },
].sort((a, b) => a.name.localeCompare(b.name))

export default function Home() {
  const [query, setQuery] = useState<QueryState>({
    phraseGroups: [{ phrases: [], useAllWords: false }],
    excludedPhrases: [],
    filterRetweets: false,
    filterReplies: false,
    filterLinks: false,
    filterImages: false,
    filterVideos: false,
    minLikes: 0,
    minRetweets: 0,
    minReplies: 0,
    fromUser: '',
    toUser: '',
    mentionUser: '',
    location: '',
    locationRadius: 5,
    language: '',
    urlDomain: '',
    listName: '',
    since: null,
    until: null,
  })

  const [currentPhrases, setCurrentPhrases] = useState<Record<number, string>>({
    0: ''
  })
  const [currentExcludedPhrase, setCurrentExcludedPhrase] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showLanguages, setShowLanguages] = useState(false)

  const buildQuery = () => {
    const parts: string[] = []
    const phraseGroupParts: string[] = []

    // Add phrase groups
    query.phraseGroups.forEach(group => {
      if (group.phrases.length > 0) {
        const operator = group.useAllWords ? ' AND ' : ' OR '
        // Always wrap in parentheses, regardless of operator
        phraseGroupParts.push(`(${group.phrases.map(p => `"${p}"`).join(operator)})`)
      }
    })

    // Join phrase groups with OR
    if (phraseGroupParts.length > 0) {
      parts.push(phraseGroupParts.join(' OR '))
    }

    // Add excluded phrases without quotation marks
    query.excludedPhrases.forEach(phrase => {
      parts.push(`-${phrase}`)
    })

    // Add filters
    if (query.filterRetweets) parts.push('-filter:retweets')
    if (query.filterReplies) parts.push('-filter:replies')
    if (query.filterLinks) parts.push('-filter:links')
    if (query.filterImages) parts.push('-filter:images')
    if (query.filterVideos) parts.push('-filter:videos')

    // Add engagement metrics
    if (query.minLikes > 0) parts.push(`min_faves:${query.minLikes}`)
    if (query.minRetweets > 0) parts.push(`min_retweets:${query.minRetweets}`)
    if (query.minReplies > 0) parts.push(`min_replies:${query.minReplies}`)

    // Add user specific filters
    if (query.fromUser) parts.push(`from:${query.fromUser}`)
    if (query.toUser) parts.push(`to:${query.toUser}`)
    if (query.mentionUser) parts.push(`@${query.mentionUser}`)

    // Add location and language
    if (query.location && query.locationRadius) {
      parts.push(`near:"${query.location}" within:${query.locationRadius}mi`)
    }
    if (query.language) parts.push(`lang:${query.language}`)

    // Add content type filters
    if (query.urlDomain) parts.push(`url:${query.urlDomain}`)
    if (query.listName) parts.push(`list:${query.listName}`)

    // Add date range
    if (query.since) parts.push(`since:${query.since.toISOString().split('T')[0]}`)
    if (query.until) parts.push(`until:${query.until.toISOString().split('T')[0]}`)

    return parts.join(' ')
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    groupIndex: number,
    type: 'phrase' | 'excluded'
  ) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      if (type === 'phrase') {
        const phrase = currentPhrases[groupIndex]?.trim()
        if (phrase) {
          setQuery(prev => ({
            ...prev,
            phraseGroups: prev.phraseGroups.map((group, i) => 
              i === groupIndex
                ? { ...group, phrases: [...group.phrases, phrase] }
                : group
            )
          }))
          setCurrentPhrases(prev => ({
            ...prev,
            [groupIndex]: ''
          }))
        }
      } else {
        const phrase = currentExcludedPhrase.trim()
        if (phrase) {
          setQuery(prev => ({
            ...prev,
            excludedPhrases: [...prev.excludedPhrases, phrase]
          }))
          setCurrentExcludedPhrase('')
        }
      }
    }
  }

  const addPhraseGroup = () => {
    const newGroupIndex = query.phraseGroups.length
    setQuery(prev => ({
      ...prev,
      phraseGroups: [...prev.phraseGroups, { phrases: [], useAllWords: false }]
    }))
    setCurrentPhrases(prev => ({
      ...prev,
      [newGroupIndex]: ''
    }))
  }

  const removePhraseGroup = (groupIndex: number) => {
    if (groupIndex === 0) return // Don't remove the first group
    setQuery(prev => ({
      ...prev,
      phraseGroups: prev.phraseGroups.filter((_, i) => i !== groupIndex)
    }))
    setCurrentPhrases(prev => {
      const newPhrases = { ...prev }
      delete newPhrases[groupIndex]
      return newPhrases
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildQuery())
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const selectLanguage = (code: string) => {
    setQuery(prev => ({ ...prev, language: code }))
    setShowLanguages(false)
  }

  const selectedLanguage = LANGUAGES.find(lang => lang.code === query.language)?.name || 'Select language'

  return (
    <div className="py-20 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-heading">X Query Builder</h1>
        <p className="text-muted-foreground">Build advanced X search queries with an intuitive UI</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="section-title">
            <MagnifyingGlassIcon className="w-6 h-6" />
            Basic Search
          </h2>
          
          {/* Phrase Groups */}
          {query.phraseGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4 mb-6 p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="input-label">
                    <HashtagIcon className="input-icon" />
                    Search Phrases Group {groupIndex + 1}
                  </label>
                  {groupIndex > 0 && (
                    <button
                      onClick={() => removePhraseGroup(groupIndex)}
                      className="text-muted-foreground hover:text-red-500 flex items-center gap-1"
                      title="Remove group"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="text-sm">Remove group</span>
                    </button>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.useAllWords}
                    onChange={(e) => setQuery(prev => ({
                      ...prev,
                      phraseGroups: prev.phraseGroups.map((g, i) =>
                        i === groupIndex ? { ...g, useAllWords: e.target.checked } : g
                      )
                    }))}
                    className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
                  />
                  Require all words
                </label>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentPhrases[groupIndex] || ''}
                  onChange={(e) => setCurrentPhrases(prev => ({
                    ...prev,
                    [groupIndex]: e.target.value
                  }))}
                  onKeyDown={(e) => handleKeyDown(e, groupIndex, 'phrase')}
                  className="flex-1 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Add phrase (press Enter to add)..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {group.phrases.map((phrase, index) => (
                  <span
                    key={index}
                    className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {phrase}
                    <button
                      onClick={() => setQuery(prev => ({
                        ...prev,
                        phraseGroups: prev.phraseGroups.map((g, i) =>
                          i === groupIndex
                            ? { ...g, phrases: g.phrases.filter((_, pi) => pi !== index) }
                            : g
                        )
                      }))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addPhraseGroup}
            className="metallic-button px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Phrase Group
          </button>

          {/* Excluded Phrases */}
          <div className="space-y-2 mt-6">
            <label className="input-label">
              <XMarkIcon className="input-icon" />
              Excluded Phrases
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentExcludedPhrase}
                onChange={(e) => setCurrentExcludedPhrase(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 0, 'excluded')}
                className="flex-1 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                placeholder='Add phrase to exclude (press Enter to add)...'
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {query.excludedPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {phrase}
                  <button
                    onClick={() => setQuery(prev => ({
                      ...prev,
                      excludedPhrases: prev.excludedPhrases.filter((_, i) => i !== index)
                    }))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section>
          <h2 className="section-title">
            <DocumentTextIcon className="w-6 h-6" />
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={query.filterRetweets}
                onChange={(e) => setQuery(prev => ({ ...prev, filterRetweets: e.target.checked }))}
                className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
              />
              <ArrowPathRoundedSquareIcon className="w-4 h-4" />
              Exclude Retweets
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={query.filterReplies}
                onChange={(e) => setQuery(prev => ({ ...prev, filterReplies: e.target.checked }))}
                className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
              />
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Exclude Replies
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={query.filterLinks}
                onChange={(e) => setQuery(prev => ({ ...prev, filterLinks: e.target.checked }))}
                className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
              />
              <LinkIcon className="w-4 h-4" />
              Exclude Links
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={query.filterImages}
                onChange={(e) => setQuery(prev => ({ ...prev, filterImages: e.target.checked }))}
                className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
              />
              <PhotoIcon className="w-4 h-4" />
              Exclude Images
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={query.filterVideos}
                onChange={(e) => setQuery(prev => ({ ...prev, filterVideos: e.target.checked }))}
                className="rounded bg-secondary border-secondary text-primary focus:ring-primary"
              />
              <VideoCameraIcon className="w-4 h-4" />
              Exclude Videos
            </label>
          </div>
        </section>

        {/* Engagement Metrics Section */}
        <section>
          <h2 className="section-title">
            <HeartIcon className="w-6 h-6" />
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="input-label">
                <HeartIcon className="input-icon" />
                Minimum Likes
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  value={query.minLikes}
                  onChange={(e) => setQuery(prev => ({ ...prev, minLikes: parseInt(e.target.value) }))}
                  className="range-slider flex-1"
                  min="0"
                  max="1000"
                />
                <input
                  type="number"
                  value={query.minLikes}
                  onChange={(e) => setQuery(prev => ({ ...prev, minLikes: parseInt(e.target.value) || 0 }))}
                  className="w-24 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <ArrowPathRoundedSquareIcon className="input-icon" />
                Minimum Retweets
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  value={query.minRetweets}
                  onChange={(e) => setQuery(prev => ({ ...prev, minRetweets: parseInt(e.target.value) }))}
                  className="range-slider flex-1"
                  min="0"
                  max="1000"
                />
                <input
                  type="number"
                  value={query.minRetweets}
                  onChange={(e) => setQuery(prev => ({ ...prev, minRetweets: parseInt(e.target.value) || 0 }))}
                  className="w-24 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <ChatBubbleLeftIcon className="input-icon" />
                Minimum Replies
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  value={query.minReplies}
                  onChange={(e) => setQuery(prev => ({ ...prev, minReplies: parseInt(e.target.value) }))}
                  className="range-slider flex-1"
                  min="0"
                  max="1000"
                />
                <input
                  type="number"
                  value={query.minReplies}
                  onChange={(e) => setQuery(prev => ({ ...prev, minReplies: parseInt(e.target.value) || 0 }))}
                  className="w-24 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  min="0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* User and Account Section */}
        <section>
          <h2 className="section-title">
            <UserIcon className="w-6 h-6" />
            User and Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="input-label">
                <UserIcon className="input-icon" />
                From User
              </label>
              <input
                type="text"
                value={query.fromUser}
                onChange={(e) => setQuery(prev => ({ ...prev, fromUser: e.target.value }))}
                className="form-input"
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <UserIcon className="input-icon" />
                To User
              </label>
              <input
                type="text"
                value={query.toUser}
                onChange={(e) => setQuery(prev => ({ ...prev, toUser: e.target.value }))}
                className="form-input"
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <UserIcon className="input-icon" />
                Mention User
              </label>
              <input
                type="text"
                value={query.mentionUser}
                onChange={(e) => setQuery(prev => ({ ...prev, mentionUser: e.target.value }))}
                className="form-input"
                placeholder="Username"
              />
            </div>
          </div>
        </section>

        {/* Location and Language Section */}
        <section>
          <h2 className="section-title">
            <MapPinIcon className="w-6 h-6" />
            Location and Language
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="input-label">
                <MapPinIcon className="input-icon" />
                Location
              </label>
              <input
                type="text"
                value={query.location}
                onChange={(e) => setQuery(prev => ({ ...prev, location: e.target.value }))}
                className="form-input"
                placeholder="City or location"
              />
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <MapPinIcon className="input-icon" />
                Radius (miles)
              </label>
              <input
                type="number"
                value={query.locationRadius}
                onChange={(e) => setQuery(prev => ({ ...prev, locationRadius: parseInt(e.target.value) || 5 }))}
                className="form-input"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <GlobeAltIcon className="input-icon" />
                Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguages(!showLanguages)}
                  className="form-input flex justify-between items-center"
                >
                  <span>{selectedLanguage}</span>
                  <ChevronUpDownIcon className="w-4 h-4" />
                </button>
                {showLanguages && (
                  <div className="language-options">
                    {LANGUAGES.map((lang) => (
                      <div
                        key={lang.code}
                        className="language-option"
                        onClick={() => selectLanguage(lang.code)}
                      >
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground">{lang.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Date Range Section */}
        <section>
          <h2 className="section-title">
            <CalendarIcon className="w-6 h-6" />
            Date Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="input-label">
                <CalendarIcon className="input-icon" />
                Since Date
              </label>
              <DatePicker
                selected={query.since}
                onChange={(date) => setQuery(prev => ({ ...prev, since: date }))}
                className="form-input"
                placeholderText="Select start date"
              />
            </div>
            <div className="space-y-2">
              <label className="input-label">
                <CalendarIcon className="input-icon" />
                Until Date
              </label>
              <DatePicker
                selected={query.until}
                onChange={(date) => setQuery(prev => ({ ...prev, until: date }))}
                className="form-input"
                placeholderText="Select end date"
              />
            </div>
          </div>
        </section>

        {/* Generated Query Section */}
        <section>
          <h2 className="section-title">
            <DocumentTextIcon className="w-6 h-6" />
            Generated Query
          </h2>
          <div className="relative">
            <textarea
              value={buildQuery()}
              readOnly
              className="w-full h-32 bg-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none font-mono"
            />
            <button
              onClick={handleCopy}
              className="copy-button absolute top-2 right-2 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              Copy
            </button>
          </div>
        </section>
      </div>

      {showToast && (
        <div className="toast">
          Query copied to clipboard!
        </div>
      )}
    </div>
  )
}
