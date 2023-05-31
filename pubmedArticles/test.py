from requests_html import HTMLSession
import requests
from requests.exceptions import ConnectionError
from bs4 import BeautifulSoup

# from selenium import webdriver
# from selenium.webdriver.common.by import By

# driver=webdriver.Chrome("E:\projects\BioCrawl\pubmedArticles\chromedriver")

def PMC():

    s = HTMLSession()
    headers={'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'}

    file=open('E:\projects\BioCrawl\pubmedArticles\input.txt','r')
    ids=file.readlines()
    for pmc in ids:
        try:
         pmcid=pmc.strip()
         base_url="https://www.ncbi.nlm.nih.gov/pmc/articles/"
         r=s.get(base_url+pmcid+'/',headers=headers,timeout=5)
         pdf_url='https://www.ncbi.nlm.nih.gov'+r.html.find('a.int-view',first=True).attrs['href']
         r=s.get(pdf_url, stream=True)
         with open(pmcid+'.pdf','wb') as f:
             for chunk in r.iter_content(chunk_size=1024):
                 if chunk:
                     f.write(chunk)
         print(pmcid)
         print(pdf_url)

        except ConnectionError as e:
            pass
            out = open('ConnectionError_pmcids.txt','a')
            out.write(pmcid + '\n')




def scrape_ncbi_nucleotide(accession_number):
    url=f"https://www.ncbi.nlm.nih.gov/nuccore/{accession_number}"
    response = requests.get(url)

    if response.status_code==200:
        soup= BeautifulSoup(response.content,'html.parser')
        print(url)
        
        Title = soup.find("div", class_="rprtheader")
        if Title:
            title = Title.find("h1").text.strip()
            print("Title :", title)

        # fastaurl=f"https://www.ncbi.nlm.nih.gov/nuccore/{accession_number}?report=fasta"
        # fastaresponse = requests.get(fastaurl)
        # fastasoup=BeautifulSoup(fastaresponse.content,'html.parser')
        # fasta=fastasoup.find("pre").text.strip()
        # print(fasta)
        

        
        print("Accession Number:",accession_number)
        # print("Description:",description)
        # print("Sequence:",)
        # print(sequence)
    else:
        print("Error: Unable to fetch data for",accession_number)

accession_number = "NC_047727.1"
scrape_ncbi_nucleotide(accession_number)

PMC()