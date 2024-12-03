import { Database } from '@/database.types';
import React from 'react';

interface StepsProps {
  steps: Database["public"]["Tables"]["recipe_steps"]["Row"][];
}

export const Steps: React.FC<StepsProps> = ({ steps }) => {
  return (
    <section>
      <h3 className="font-bold text-lg">Steps</h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm">
        {steps.toSorted((a, b) => a.step_order - b.step_order).
          map(step => (
            <li key={step.id}>
              {step.description}
            </li>
          ))}
      </ol>
    </section>
  )
}
