# Classification Annotation System in Python (CL-ASP)
:snake:

CL-ASP is web-based annotation system which facilitates annotation tasks at a variety of levels. The system takes a novel approach to text representation, allowing users to quickly project and cluster sections of the vector space. As a result, words and their latent interactions can be rapidly investigated, and entity tags quickly assigned. Once given, tags aid toward the retrieval of text, where words previously discovered can be examined further in context. From here, a simple binary interface allows users to quickly curate a dataset of examples, by either agreeing or disagreeing with exemplar pieces of text presented to them. Once complete, the dataset can be easily exported and used to train machine learning models for classification or NER applications.

The Word2Vec model that enables the projections has been pre-trained with the Enron dataset, as it appears in [./data/enron/emails.csv]().

All pre-processing and modelling techniques implemented can be modified and rerun from [./notebooks/ppam_script.ipynb]() if desired; HTML version also available to view for those without Jupyter.

Manually annotated datasets are exported to .csv, and can be found under [./out/]()

## Requirements
Use [pip](https://pip.pypa.io/en/stable/) to install the requirements to run CL-ASP.
```bash
pip install -r requirements.txt
```
Or alternatively [conda](https://docs.conda.io/en/latest/), although there might be issues locating [umap-learn](https://anaconda.org/conda-forge/umap-learn).
```bash
conda install --file requirements.txt
```

## Usage
Start the server.
```bash
python app.py
```
Navigate to http://localhost:8080/ to begin annotation session.

<u>Steps:</u><br>
1. Enter a high-level class label that best describes the examples being explored within the text, e.g. 'Meetings'.
2. Search for words likely associated with the given label, e.g. 'Monday'. When presented with the vector space plot relative to the word chosen, investigate similar words and patterns that may support the preparation of relevant text.
3. Once a set of words relating to the given label have been collected and annotated, the contextual annotation session can begin, e.g:
    ```python
    { 'Weekdays' : { 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' } }
    ```
4. Accept, reject, or skip the contextual examples of text as they appear. Metrics of task are displayed to help keep track of progress.
5. Once enough samples have been annotated, export the dataset.

## Data
Original CSV version of the ENRON emails available at [kaggle](https://www.kaggle.com/wcukierski/enron-email-dataset)

## License
[MIT](https://choosealicense.com/licenses/mit/)
