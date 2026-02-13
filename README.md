# network-backup-website-portal
Web-based system for managing network device inventory, configuration, backups and scan analysis. portal, built with React and Flask.


## Core Features
###  Security
- JWT-based authentication
- Role-based access control (cliente, analista, gerente)
- Token expiration management

### Inventory Management
- Structured JSON-based device inventory
- Normalized device fields (Hostname, Model, Serial, Location, Type)
- Alternative IP support
- Autocomplete search by IP

### Backup Management
- Configuration backup listing
- Secure file download
- File size and timestamp parsing
- Organized directory structure by state and city

###  Scan Analysis Workflow
- Integration with network scan results (JSON-based)
- Automatic detection of incomplete inventory entries
- Interactive review per device (card-based UI)
- Atomic inventory updates after correction

### Python Network Automation
- Multi-vendor device handling
- Switch automation (Cisco, Datacom, Huawei, etc.)
- Firewall automation (Fortinet and others)
- Structured device type detection
- Automated inventory enrichment from scan results


---

##  Architecture
### Backend
- Python
- Flask
- JWT Authentication
- JSON-based structured inventory
- Atomic file writes for data integrity
- Scan comparison engine
- Modular route structure

### Frontend
- React
- React Router
- Component-based layout
- Card-based visualization system
- Responsive UI adjustments

---

##  Project Structure
backend/
app.py
json/
scan/
frontend/
src/
components/
pages/
styles/


---

##  Scan Analysis Workflow
1. Network scan generates a structured JSON result.
2. Backend compares scan data with inventory.
3. Devices with missing required fields are flagged.
4. Analyst reviews each device via card interface.
5. Missing fields are completed and saved atomically.

---

##  Security
### Application Layer
- JWT token-based authentication
- Role-based access control (cliente, analista, gerente)
- Token expiration management
- Environment variable secret key handling

### Network Layer
- Access restricted to internal network
- VPN required for external access
- Hosted in protected server environment
