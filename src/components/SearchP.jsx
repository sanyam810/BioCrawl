import React, { useState } from 'react';
import axios from 'axios';

const SearchP = ({ search, setSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission

    try {
      const response = await axios.get(
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        {
          params: {
            db: 'pubmed',
            term: query,
            retmode: 'json',
            retmax: 10, // Number of results to retrieve
          },
        }
      );

      console.log('Response:', response.data);

      const data = response.data;
      const articleIds = data.esearchresult.idlist;
      
      console.log('D: ', data);
      console.log('Article IDs:', articleIds);

      const articles = await Promise.all(
        articleIds.map(async (articleId) => {
          try {
            const articleResponse = await axios.get(
              'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi',
              {
                params: {
                  db: 'pubmed',
                  id: articleId,
                  retmode: 'xml',
                },
              }
            );

            const articleData = articleResponse.data;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(articleData, 'text/xml');
            const title = xmlDoc.querySelector('ArticleTitle')?.textContent;
            const abstract = xmlDoc.querySelector('AbstractText')?.textContent;
            const authors = Array.from(xmlDoc.querySelectorAll('Author')).map(
              (authorNode) => authorNode.querySelector('LastName')?.textContent
            );

            return { title, abstract, authors };
          } catch (error) {
            console.error(`Error retrieving article with ID ${articleId}:`, error);
            return null; // Skip the failed article
          }
        })
      );

      setResults(articles.filter((article) => article !== null)); // Filter out null articles
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:px-10">
      <div className="mx-auto max-w-md">
        <form action="" className="relative mx-auto w-max" onSubmit={handleSearch}>
          <div className="flex">
            <input
              type="search"
              className="peer cursor-pointer relative z-10 h-12 w-full rounded-full border bg-transparent pl-12 outline-none focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="submit" className="ml-2 bg-gray-200 py-2 px-4 rounded">
              Search
            </button>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-y-0 my-auto h-8 w-12 border-r border-transparent stroke-gray-500 px-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      <div className="mt-8">
        {results.length > 0 ? (
          results.map((article, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-lg">{article.title}</h3>
              <p className="text-gray-600">{article.authors?.join(', ')}</p>
              <p>{article.abstract}</p>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchP;
