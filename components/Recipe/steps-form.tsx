"use client"

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Database } from '@/database.types';

interface Step {
  step_order: Number;
  description: String;
}

interface StepProps {
  step: Step[];
  onChange: (steps: Step[] | null) => void;
}

export const StepsInputs = () => {
  const [rows, setRows] = useState(1)
  return (
    <div className="flex">
      <Input type="text" />
      <Button type="button" onClick={() => setRows(rows + 1)}>
        +
      </Button>
      {rows}
    </div>
  )
}
