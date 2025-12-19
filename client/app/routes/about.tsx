import { Image } from '@mantine/core';

export default function AboutPage() {
  return (
    <div>
      <h1>About Grandma's Kitchen</h1>
      <p>
        Recipe website for Grandma Pat's treasured family recipes, collected over time by Abby and others.
      </p>
      <Image
        src="/images/about/pat-abby-1.png" alt="Grandma Pat with Abby"
        radius="md"
        mb="md"
        maw={600}
        mx="auto"
      />
      </div>
  );
}