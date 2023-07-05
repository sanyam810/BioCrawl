import React, { useState } from 'react';
import axios from 'axios';

const SearchP = ({ search, setSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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
            retmax: 10, // Number of results per page
            retstart: (currentPage - 1) * 10, // Calculate the start index for the current page
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
          let articleData, title, abstract, authors, articleIdValue = '';

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

            articleData = articleResponse.data;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(articleData, 'text/xml');
            title = xmlDoc.querySelector('ArticleTitle')?.textContent;
            abstract = xmlDoc.querySelector('AbstractText')?.textContent;
            authors = Array.from(xmlDoc.querySelectorAll('Author')).map(
              (authorNode) => authorNode.querySelector('LastName')?.textContent
            );

            // Retrieve article ID
            const articleIdElement = xmlDoc.querySelector('ArticleIdList ArticleId[IdType="pubmed"]');
            articleIdValue = articleIdElement ? articleIdElement.textContent : '';
          } catch (error) {
            console.error(`Error retrieving article with ID ${articleId}:`, error);
            return null; // Skip the failed article
          }

          return { articleId: articleIdValue, title, abstract, authors };
        })
      );

      setResults(articles.filter((article) => article !== null)); // Filter out null articles
      setTotalPages(Math.ceil(data.esearchresult.count / 10)); // Calculate the total number of pages
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openArticle = (articleId) => {
    window.open(`https://www.ncbi.nlm.nih.gov/pubmed/${articleId}`, '_blank');
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
              <p className="text-gray-600">
                <a href={`https://www.ncbi.nlm.nih.gov/pubmed/${article.articleId}`} target="_blank" rel="noopener noreferrer">
                  {article.articleId}
                </a>{' '}
                - {article.authors?.join(', ')}
              </p>
              <p>{article.abstract}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No results</p>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex justify-center mt-8">
          {currentPage > 1 && (
            <button
              className="mr-4 bg-gray-200 py-2 px-4 rounded"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          )}

          {currentPage < totalPages && (
            <button
              className="bg-gray-200 py-2 px-4 rounded"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchP;
