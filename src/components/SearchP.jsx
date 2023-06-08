import React from 'react';
import { useState } from 'react';
import axios from 'axios';

const SearchP = ({ search, setSearch }) => {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`, {
        params: {
          db: 'pubmed',
          term: query,
          retmode: 'json',
          retmax: 10, // Number of results to retrieve
        },
      });

      const data = response.data;
      // Extract the relevant information from the response data
      const articleIds = data.esearchresult.idlist;

      // Retrieve additional information for each article (e.g., title, abstract, authors, etc.)
      const articles = await Promise.all(
        articleIds.map(async (articleId) => {
          const articleResponse = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi`, {
            params: {
              db: 'pubmed',
              id: articleId,
              retmode: 'json',
            },
          });

          const articleData = articleResponse.data;
          // Extract the relevant information from the articleData
          const title = articleData.result[articleId].title;
          const abstract = articleData.result[articleId].abstract;
          const authors = articleData.result[articleId].authors;

          return { title, abstract, authors };
        })
      );

      setResults(articles);
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
  };


  return (
    <div className="relative rounded-2xl bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:px-10">
      <div className="mx-auto max-w-md">
        <form action="" className="relative mx-auto w-max">
          <input
            type="search"
            className="peer cursor-pointer relative z-10 h-12 w-12 rounded-full border bg-transparent pl-12 outline-none focus:w-full focus:cursor-text focus:border-lime-300 focus:pl-16 focus:pr-4"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-y-0 my-auto h-8 w-12 border-r border-transparent stroke-gray-500 px-3.5 peer-focus:border-lime-300 peer-focus:stroke-lime-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchP;
