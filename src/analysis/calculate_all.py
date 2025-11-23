"""Calculate GDI for all networks"""
import pandas as pd
from simple_metrics import calculate_gdi
import json

networks = {
    'ethereum': '../../data/raw/2025-11-22-ethereum-ips.csv',
    'polygon': '../../data/raw/2025-11-22-polygon-ips.csv',
}

results = {}

for network_name, filepath in networks.items():
    try:
        df = pd.read_csv(filepath)
        df = df.dropna(subset=['lat', 'lon'])

        result = calculate_gdi(df)
        results[network_name] = result

        print(f"\n{'='*60}")
        print(f"GDI v0 Results - {network_name.title()}")
        print(f"{'='*60}")
        print(f"\nOverall GDI: {result['gdi']} - {result['interpretation']}")
        print(f"Total Nodes: {result['total_nodes']:,}")

        print(f"\n{'Physical Distribution (PDI)':-^60}")
        print(f"  Score: {result['pdi']['pdi']} - {result['pdi']['interpretation']}")
        print(f"  Spatial HHI: {result['pdi']['spatial_hhi']}")

        print(f"\n{'Jurisdictional Diversity (JDI)':-^60}")
        print(f"  Score: {result['jdi']['jdi']} - {result['jdi']['interpretation']}")
        print(f"  Countries: {result['jdi']['effective_countries']}/{result['jdi']['num_countries']}")
        print(f"  Top country: {list(result['jdi']['top_3_countries'].keys())[0]}")

        print(f"\n{'Infrastructure Heterogeneity (IHI)':-^60}")
        print(f"  Score: {result['ihi']['ihi']} - {result['ihi']['interpretation']}")
        print(f"  Provider HHI: {result['ihi']['provider_hhi']}")

    except FileNotFoundError:
        print(f"\nSkipping {network_name} - file not found")
        continue

print(f"\n{'='*60}\n")

# Save to JSON for frontend
with open('../../data/gdi_results.json', 'w') as f:
    json.dump(results, f, indent=2)
    print("Results saved to data/gdi_results.json")
