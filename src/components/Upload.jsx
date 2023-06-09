import React from 'react'
import axios from 'axios'


const Upload=()=>{

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const text = await readFileAsync(file);
    await PMC(text);
  };

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (event) => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file);
    });
  };

  const PMC = async (text) => {
    const proxyUrl = 'http://localhost:8080'; // Proxy server URL
  
    const ids = text.split('\n');
    for (const pmc of ids) {
      try {
        const pmcid = pmc.trim();
        const base_url = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';
        const response = await axios.get(`${proxyUrl}/${base_url}${pmcid}`, {
          timeout: 5000,
        });
        const pdfUrlElement = response.data.querySelector('a.int-view');
        if (!pdfUrlElement) {
          console.log(`PDF URL not found for PMCID: ${pmcid}`);
          continue;
        }
        const pdf_url = 'https://www.ncbi.nlm.nih.gov' + pdfUrlElement.getAttribute('href');
        // Trigger file download
        window.open(`${proxyUrl}/${pdf_url}`, '_blank');
        console.log(`Downloading file for PMCID: ${pmcid}`);
        console.log(`PDF URL: ${pdf_url}`);
      } catch (error) {
        if (error.code === 'ECONNRESET') {
          continue;
        }
        const out = 'ConnectionError_pmcids.txt';
        // Write pmcid to the file
        // ...
      }
    }
  };
  

    return (
        <div className="relative rounded-2xl bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:px-10">
          <div className="mx-auto max-w-md">
            <form action="" className="relative mx-auto w-max">
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1zm2-3a3 3 0 100 6 3 3 0 000-6z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt"
                onChange={handleFileUpload}
              />
            </form>
          </div>
        </div>
    )
}

export default Upload;