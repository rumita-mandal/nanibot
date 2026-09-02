import RegionalWisdomClient from './RegionalWisdomClient';

const REGIONS = [
  'West Bengal',
  'Bengal',
  'Punjab & North',
  'Punjab',
  'Kerala & South',
  'Kerala',
  'Goa & Konkan',
  'Goa',
  'Rajasthan',
];

export async function generateStaticParams() {
  return REGIONS.map((region) => ({
    region: encodeURIComponent(region),
  }));
}

export default function RegionalWisdomPage() {
  return <RegionalWisdomClient />;
}
