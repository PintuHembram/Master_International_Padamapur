import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Question = { text: string; answer: number };

const makeQuestion = (): Question => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
  if (op === '-') {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return { text: `${hi} − ${lo}`, answer: hi - lo };
  }
  if (op === '×') return { text: `${a} × ${b}`, answer: a * b };
  return { text: `${a} + ${b}`, answer: a + b };
};

interface MathCaptchaProps {
  /** Called whenever the validity of the entered answer changes. */
  onVerify: (ok: boolean) => void;
  /** Increment to force a new question (e.g. after a failed login). */
  resetSignal?: number;
  disabled?: boolean;
}

/**
 * Lightweight math captcha for login forms. The answer never leaves the
 * client; it simply forces a human-in-the-loop before credentials are sent.
 */
export const MathCaptcha = ({ onVerify, resetSignal = 0, disabled }: MathCaptchaProps) => {
  const [question, setQuestion] = useState<Question>(makeQuestion);
  const [value, setValue] = useState('');
  const lastValid = useRef<boolean | null>(null);

  const refresh = useCallback(() => {
    setQuestion(makeQuestion());
    setValue('');
  }, []);

  // External reset (failed login attempt, etc.)
  useEffect(() => {
    if (resetSignal > 0) refresh();
  }, [resetSignal, refresh]);

  // Report validity only when it actually changes (avoids render loops)
  useEffect(() => {
    const ok = value.trim() !== '' && Number(value) === question.answer;
    if (ok !== lastValid.current) {
      lastValid.current = ok;
      onVerify(ok);
    }
  }, [value, question, onVerify]);

  return (
    <div className="space-y-2">
      <Label htmlFor="math-captcha" className="text-sm font-medium">
        Security Check
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 select-none">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono font-semibold tracking-wider whitespace-nowrap">
            {question.text} = ?
          </span>
        </div>
        <Input
          id="math-captcha"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Answer"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
          className="w-24"
          disabled={disabled}
          required
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={disabled}
          aria-label="Get a new question"
          title="New question"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Solve the sum to prove you are human.</p>
    </div>
  );
};
