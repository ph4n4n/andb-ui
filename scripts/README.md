# Andb Scripts

Utility scripts for Andb development and testing.

## Load Sample Data

Load mock comparison data for testing the UI without real database connections.

### Usage

**From npm:**
```bash
npm run sample:load
```

**Direct:**
```bash
node scripts/load-sample-data.js
```

### What it does

Loads sample data into electron-store:
- **3 Tables** with different statuses (different, missing_in_target, missing_in_source)
- **1 Procedure** with changes
- **0 Functions** (empty for testing)

Data is stored in:
- macOS: `~/Library/Application Support/Andb/`
- Windows: `%APPDATA%\Andb\`
- Linux: `~/.config/Andb/`

### View the data

1. Run `npm run sample:load`
2. Start Andb: `npm run electron:dev`
3. Navigate to **Compare** page
4. Select **DEV → STAGE** pair
5. View comparison results

### Clear sample data

To remove all sample data:
```bash
rm -rf ~/Library/Application\ Support/Andb/
```

## Sample Data Structure

### Tables
- `users` - Has column and index changes
- `products` - Missing in target (new table)
- `old_logs` - Missing in source (deprecated table)

### Procedures
- `sp_get_user_stats` - Different implementation between DEV and STAGE

### Use Cases
- Testing UI without database setup
- Demo presentations
- UI development
- Regression testing

