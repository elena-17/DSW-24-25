# DSW-24-25
Web application for peer-to-peer microtransactions

## Structure
```
📂 .    
    ├──── 📂 backend_bank
    ├──── 📂 backend_main  
    └──── 📄 README.md 
```
* `backend_bank` - contains the credit card backend to simulate a bank
* `backend_main` - contains the main backend with core functionality for the application

## Development

Configure pre-commit for code formatting and linting

1. Install pre-commit
```bash
pip install pre-commit
```

2. Install pre-commit hooks
```bash
pre-commit install
```

3. Run pre-commit checks
```bash
pre-commit run --all-files
```