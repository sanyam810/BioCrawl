import React, { useState } from 'react';
import axios from 'axios';

const IdConverter = () => {
  const [id, setId] = useState('');
  const [idType, setIdType] = useState('pmid');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleConvert = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const baseURL = 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/';
      const params = new URLSearchParams({
        ids: id,
        idtype: idType,
        format: 'html',
        versions: 'yes',
        showaiid: 'yes',
        tool: 'my_tool',
        email: email,
        '.submit': 'Submit',
      });

      const response = await axios.get(`${baseURL}?${params}`);

      if (response.status === 200) {
        setResult(response.data);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:px-10">
      <div className="mx-auto max-w-md">
        <form action="" className="relative mx-auto w-max" onSubmit={handleConvert}>
          <div className="flex mb-4">
            <input
              type="text"
              className="peer cursor-pointer relative z-10 w-full rounded border bg-transparent pl-2 outline-none focus:outline-none"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter ID"
            />
            <select
              className="ml-2 cursor-pointer rounded border bg-transparent pl-2 outline-none focus:outline-none"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
            >
              <option value="pmid">PMID</option>
              <option value="pmcid">PMCID</option>
              <option value="doi">DOI</option>
              <option value="mid">MID</option>
            </select>
          </div>
          <div className="flex mb-4">
            <input
              type="email"
              className="peer cursor-pointer relative z-10 w-full rounded border bg-transparent pl-2 outline-none focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <button type="submit" className="ml-2 bg-gray-200 py-2 px-4 rounded">
              Convert
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occurred during conversion: {error}</p>}
        {result && <div dangerouslySetInnerHTML={{ __html: result }} />}
      </div>
    </div>
  );
};

export default IdConverter;
