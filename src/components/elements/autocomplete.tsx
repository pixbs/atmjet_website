'use client'
import { useState, useEffect, InputHTMLAttributes } from 'react';

interface AutoCompleteProps extends InputHTMLAttributes<HTMLInputElement> {
  suggestionsFile?: string;
}

export function AutoComplete(props: AutoCompleteProps) {
  const { value, onChange, suggestionsFile = 'data/autocomplete.json', ...inputProps } = props;
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Fetch suggestions from the JSON file
    fetch(suggestionsFile)
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((err) => console.error(err));
  }, [suggestionsFile]);

  const filteredSuggestions = suggestions
    .filter((suggestion) =>
      suggestion.toLowerCase().includes((value as string).toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e);
          }
          setShowSuggestions(true);
        }}
        {...inputProps}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-900 mt-4 border shadow-lg max-h-40 overflow-y-auto bottom-0 translate-y-full rounded-xl">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 cursor-pointer hover:bg-gray-800 text-gray-100"
              onClick={() => {
                if (onChange) {
                  onChange({ target: { value: suggestion } } as any);
                }
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
