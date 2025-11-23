"""
Generate realistic time-series data for GDI metrics

Creates synthetic historical data with:
- Realistic stochasticity (noise)
- Slow trend toward decentralization
- Anchored to actual current measurements
"""

import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import json


def add_noise(values, noise_level=0.05):
    """Add realistic noise to time series"""
    noise = np.random.normal(0, noise_level, len(values))
    return values + noise * values


def generate_trend(start_value, end_value, num_points, trend_type='linear'):
    """
    Generate trend line from start to end

    Args:
        start_value: Initial value (30 days ago)
        end_value: Final value (today's actual measurement)
        num_points: Number of data points
        trend_type: 'linear', 'sigmoid', or 'exponential'
    """
    if trend_type == 'linear':
        return np.linspace(start_value, end_value, num_points)
    elif trend_type == 'sigmoid':
        # S-curve for gradual then accelerating change
        x = np.linspace(-6, 6, num_points)
        sigmoid = 1 / (1 + np.exp(-x))
        # Scale to start/end values
        return start_value + (end_value - start_value) * sigmoid
    elif trend_type == 'exponential':
        # Exponential approach to end value
        x = np.linspace(0, 3, num_points)
        exp_curve = 1 - np.exp(-x)
        return start_value + (end_value - start_value) * exp_curve
    else:
        raise ValueError(f"Unknown trend type: {trend_type}")


def generate_morans_i_series(current_value=0.4043, days=30):
    """
    Generate Moran's I time series

    Trend: Decreasing (from higher clustering toward more random)
    Current: 0.4043 (moderate clustering)
    Target: Move from ~0.55 to current value
    """
    # Start with higher clustering, trend toward current
    start_value = 0.55
    base_trend = generate_trend(start_value, current_value, days, trend_type='sigmoid')

    # Add realistic noise (Moran's I typically has moderate variability)
    noisy = add_noise(base_trend, noise_level=0.08)

    # Ensure final value is exactly the current measurement
    noisy[-1] = current_value

    # Clip to valid range [-1, 1], though in practice usually [0, 1]
    return np.clip(noisy, -1, 1)


def generate_spatial_hhi_series(current_value=0.0184, days=30):
    """
    Generate Spatial HHI time series

    Trend: Decreasing (from higher concentration toward lower)
    Current: 0.0184 (very low concentration)
    Target: Move from ~0.035 to current value
    """
    # Start with higher concentration
    start_value = 0.035
    base_trend = generate_trend(start_value, current_value, days, trend_type='linear')

    # Add realistic noise (HHI can jump if nodes relocate)
    noisy = add_noise(base_trend, noise_level=0.10)

    # Ensure final value matches current
    noisy[-1] = current_value

    # HHI range [0, 1]
    return np.clip(noisy, 0, 1)


def generate_enl_series(current_value=237.5, days=30):
    """
    Generate Effective Number of Locations time series

    Trend: Increasing (nodes spreading to more locations)
    Current: 237.5 effective locations
    Target: Move from ~180 to current value
    """
    # Start with fewer effective locations
    start_value = 180
    base_trend = generate_trend(start_value, current_value, days, trend_type='exponential')

    # Add noise (ENL relatively stable, but can change as nodes move)
    noisy = add_noise(base_trend, noise_level=0.06)

    # Ensure final value matches
    noisy[-1] = current_value

    # ENL must be positive
    return np.clip(noisy, 1, None)


def generate_ann_series(current_value=0.073, days=30):
    """
    Generate Average Nearest Neighbor time series

    Trend: Increasing (less clustering, more dispersion)
    Current: 0.073 (strong clustering)
    Target: Move from ~0.05 to current value
    """
    # Start with even stronger clustering
    start_value = 0.05
    base_trend = generate_trend(start_value, current_value, days, trend_type='sigmoid')

    # Add noise (ANN can be quite variable)
    noisy = add_noise(base_trend, noise_level=0.12)

    # Ensure final value matches
    noisy[-1] = current_value

    # ANN typically [0, 2.15] for point patterns
    return np.clip(noisy, 0, 2.15)


def generate_timeseries_data(
    network='ethereum',
    current_metrics=None,
    days=30,
    output_format='json'
):
    """
    Generate complete time-series dataset

    Args:
        network: Network name
        current_metrics: Dict with current metric values (from latest analysis)
        days: Number of days of historical data
        output_format: 'json' or 'csv'

    Returns:
        DataFrame with time-series data
    """
    # Use provided current metrics or defaults
    if current_metrics is None:
        current_metrics = {
            'morans_i': 0.4043,
            'spatial_hhi': 0.0184,
            'enl': 237.5,
            'ann': 0.073
        }

    # Generate date range (ending today)
    end_date = datetime.utcnow()
    dates = [end_date - timedelta(days=i) for i in range(days-1, -1, -1)]

    # Generate each metric's time series
    morans_i = generate_morans_i_series(current_metrics['morans_i'], days)
    spatial_hhi = generate_spatial_hhi_series(current_metrics['spatial_hhi'], days)
    enl = generate_enl_series(current_metrics['enl'], days)
    ann = generate_ann_series(current_metrics['ann'], days)

    # Create DataFrame
    df = pd.DataFrame({
        'date': dates,
        'network': network,
        'morans_i': morans_i,
        'morans_i_interpretation': ['Significant clustering' if m > 0.3 else
                                    'Moderate clustering' if m > 0.1 else
                                    'Random pattern' for m in morans_i],
        'spatial_hhi': spatial_hhi,
        'spatial_hhi_interpretation': ['High concentration' if h > 0.25 else
                                        'Moderate concentration' if h > 0.15 else
                                        'Low concentration' for h in spatial_hhi],
        'enl': enl,
        'ann': ann,
        'ann_interpretation': ['Significant clustering' if a < 0.8 else
                              'Random pattern' if a < 1.2 else
                              'Dispersion' for a in ann]
    })

    # Add computed fields
    df['timestamp'] = df['date'].apply(lambda x: x.isoformat())
    df['date_str'] = df['date'].apply(lambda x: x.strftime('%Y-%m-%d'))

    return df


def save_timeseries(df, output_dir, network='ethereum', format='both'):
    """
    Save time-series data to file(s)

    Args:
        df: DataFrame with time-series data
        output_dir: Directory to save files
        network: Network name
        format: 'json', 'csv', or 'both'
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if format in ['json', 'both']:
        # JSON format for web UI
        # Drop datetime objects, keep string representations
        df_json = df.drop(columns=['date']).copy()

        json_data = {
            'network': network,
            'generated_at': datetime.utcnow().isoformat(),
            'num_days': len(df),
            'metrics': ['morans_i', 'spatial_hhi', 'enl', 'ann'],
            'data': df_json.to_dict(orient='records')
        }

        json_path = output_dir / f'{network}_timeseries.json'
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        print(f"Saved JSON: {json_path}")

    if format in ['csv', 'both']:
        # CSV format for analysis
        csv_path = output_dir / f'{network}_timeseries.csv'
        df.to_csv(csv_path, index=False)
        print(f"Saved CSV: {csv_path}")

    return df


def main():
    """Generate time-series data for Ethereum"""

    # Load current metrics from latest analysis
    analysis_dir = Path(__file__).parent.parent.parent / "data" / "analysis_outputs"
    latest_run = "ethereum_6958nodes_500km_h3-5_b4c6b09a"

    results_path = analysis_dir / latest_run / "output" / "results.json"

    if results_path.exists():
        with open(results_path) as f:
            results = json.load(f)

        current_metrics = {
            'morans_i': results['morans_i']['value'],
            'spatial_hhi': results['spatial_hhi']['value'],
            'enl': results['enl']['value'],
            'ann': results['ann']['value']
        }
        print(f"Loaded current metrics from {latest_run}")
    else:
        print("Using default current metrics")
        current_metrics = None

    # Generate 30 days of data
    df = generate_timeseries_data(
        network='ethereum',
        current_metrics=current_metrics,
        days=30
    )

    print(f"\nGenerated {len(df)} days of time-series data")
    print(f"\nSample (first 3 days):")
    print(df[['date_str', 'morans_i', 'spatial_hhi', 'enl', 'ann']].head(3))
    print(f"\nSample (last 3 days):")
    print(df[['date_str', 'morans_i', 'spatial_hhi', 'enl', 'ann']].tail(3))

    # Save to data directory
    output_dir = Path(__file__).parent.parent.parent / "data" / "timeseries"
    save_timeseries(df, output_dir, network='ethereum', format='both')

    print(f"\n✅ Time-series data generated successfully!")
    print(f"📁 Output directory: {output_dir}")


if __name__ == "__main__":
    main()
