import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchG = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${query}`
      );

      if (response.status === 200) {
        const xmlResponse = response.data;
        parseXmlResponse(xmlResponse);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const parseXmlResponse = (xmlResponse) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
    const idList = xmlDoc.getElementsByTagName('Id');

    if (idList.length > 0) {
      const ids = Array.from(idList).map((id) => id.textContent);
      getGeneDetails(ids);
    } else {
      console.error('IdList not found or empty');
    }
  };

  const getGeneDetails = async (geneIds) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneIds.join(',')}`
      );

      if (response.status === 200) {
        const xmlResponse = response.data;
        parseGeneDetails(xmlResponse);
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const parseGeneDetails = (xmlResponse) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
    const geneEntries = xmlDoc.getElementsByTagName('DocumentSummary');

    const results = Array.from(geneEntries).map((entry) => {
      const geneId = entry.querySelector('Id')?.textContent || '';
      const geneSymbol = entry.querySelector('NomenclatureSymbol')?.textContent || '';
      const geneDescription = entry.querySelector('Description')?.textContent || '';
      const geneType = entry.querySelector('Type')?.textContent || '';
      const species = entry.querySelector('OrganismName')?.textContent || '';
      const chromosome = entry.querySelector('Chromosome')?.textContent || '';
      const coordinates = entry.querySelector('GenomicInfo')?.querySelector('ChrStart')?.textContent || '';
      const mrnaTranscript = entry.querySelector('OtherAliases')?.querySelector('mrna')?.textContent || '';
      const proteinIsoform = entry.querySelector('OtherAliases')?.querySelector('protein')?.textContent || '';
      const taxonomyId = extractTaxonomyId(xmlResponse, geneId);
      const accessionNumber = extractAccessionNumber(xmlResponse, geneId);

      return {
        id: geneId,
        symbol: geneSymbol,
        description: geneDescription,
        type: geneType,
        species,
        chromosome,
        coordinates,
        transcript: mrnaTranscript,
        proteinIsoform,
        taxonomyId,
        accessionNumber,
      };
    });

    setResults(results);
  };

  const extractTaxonomyId = (xmlResponse, geneId) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
    const geneEntry = xmlDoc.querySelector(`Entrezgene > Entrezgene_track-info > Gene-track > Gene-track_geneid[text="${geneId}"]`)?.parentNode;
  
    if (geneEntry) {
      const taxonomyIdNode = geneEntry.querySelector('Entrezgene_source > BioSource > Org-ref > Org-ref_db > Dbtag > Dbtag_db[text="taxon"] > Dbtag_tag > Object-id > Object-id_id');
      return taxonomyIdNode ? taxonomyIdNode.textContent : '';
    }
  
    return '';
  };
  
  const extractAccessionNumber = (xmlResponse, geneId) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlResponse, 'text/xml');
    const geneEntry = xmlDoc.querySelector(`Entrezgene > Entrezgene_track-info > Gene-track > Gene-track_geneid[text="${geneId}"]`)?.parentNode;
  
    if (geneEntry) {
      const accessionNode = geneEntry.querySelector('Entrezgene_gene > Gene-ref > Gene-ref_locus');
      return accessionNode ? accessionNode.textContent : '';
    }
  
    return '';
  };
  
  useEffect(() => {
    const fetchTaxonomyAndAccessionForResults = async () => {
      const resultsWithTaxonomyAndAccession = await Promise.all(
        results.map(async (result) => {
          const { geneId } = result;
          const taxonomyId = await fetchTaxonomyId(xmlResponse, geneId);
          const accessionNumber = await fetchAccessionNumber(xmlResponse, geneId);
          return { ...result, taxonomyId, accessionNumber };
        })
      );
  
      setResults(resultsWithTaxonomyAndAccession);
    };
  
    if (results.length > 0) {
      fetchTaxonomyAndAccessionForResults();
    }
  }, [results]);
  

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
        {isLoading && <p>Loading...</p>}
        {error && <p>Error occurred during search: {error}</p>}
        {results.length > 0 ? (
          results.map((record, index) => (
            <div key={index} className="mb-4">
              {/* Render the relevant information from the gene record */}
              <h3>ID: {record.id}</h3>
              <p>Symbol: {record.symbol}</p>
              <p>Description: {record.description}</p>
              <p>Type: {record.type}</p>
              <p>Species: {record.species}</p>
              <p>Chromosome: {record.chromosome}</p>
              <p>Coordinates: {record.coordinates}</p>
              <p>mRNA Transcript: {record.transcript}</p>
              <p>Protein Isoform: {record.proteinIsoform}</p>
              <p>Taxonomy ID: {record.taxonomyId}</p>
              <p>Accession Number: {record.accessionNumber}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No results</p>
        )}
      </div>
    </div>
  );
};

export default SearchG;
