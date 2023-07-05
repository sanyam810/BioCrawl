import React, { useState } from 'react';
import axiosJsonp from 'axios-jsonp';

const BlastSearch = () => {
  const [sequence, setSequence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosJsonp({
        url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
        params: {
          CMD: 'Put',
          PROGRAM: 'blastn',
          DATABASE: 'nt',
          QUERY: sequence,
          FORMAT_TYPE: 'JSON2',
          JSONP: 'callback',
        },
      });

      if (response.status === 200) {
        const jobId = response.data.job_id;
        await pollResults(jobId);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pollResults = async (jobId) => {
    try {
      const response = await axiosJsonp({
        url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
        params: {
          CMD: 'Get',
          FORMAT_OBJECT: 'SearchInfo',
          RID: jobId,
          FORMAT_TYPE: 'JSON2',
          JSONP: 'callback',
        },
      });

      if (response.status === 200) {
        const status = response.data.search_info.status;
        if (status === 'READY') {
          await fetchResults(jobId);
        } else if (status === 'UNKNOWN') {
          throw new Error('Job not found');
        } else {
          setTimeout(() => pollResults(jobId), 5000); // Poll again after 5 seconds
        }
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchResults = async (jobId) => {
    try {
      const response = await axiosJsonp({
        url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
        params: {
          CMD: 'Get',
          FORMAT_TYPE: 'JSON2_S',
          RID: jobId,
          JSONP: 'callback',
        },
      });

      if (response.status === 200) {
        const results = response.data.BlastOutput2[0].report.results.search.hits;
        setResults(results);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:px-10">
      <div className="mx-auto max-w-md">
        <form action="" className="relative mx-auto w-max" onSubmit={handleSearch}>
          <div className="flex">
            <textarea
              rows="4"
              className="peer cursor-pointer relative z-10 w-full rounded border bg-transparent pl-2 outline-none focus:outline-none"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
            ></textarea>
            <button type="submit" className="ml-2 bg-gray-200 py-2 px-4 rounded">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occurred during search: {error}</p>}
        {results.length > 0 ? (
          results.map((hit, index) => (
            <div key={index} className="mb-4">
              {/* Render the relevant information from the BLAST hit */}
              <h3>Hit #{index + 1}</h3>
              <p>Accession: {hit.accession}</p>
              <p>Title: {hit.description[0].title}</p>
              <p>Length: {hit.len}</p>
              <p>E-value: {hit.hsps[0].evalue}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No results</p>
        )}
      </div>
    </div>
  );
};

export default BlastSearch;
