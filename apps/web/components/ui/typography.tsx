export function TypographyH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}

export function TypographyH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export function TypographyH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  );
}

export function TypographyH4({ children }: { children: string }) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  );
}

export function TypographyP({ children }: { children: React.ReactNode }) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function TypographyBlockquote({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  );
}

export function TypographyList() {
  return (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      <li>1st level of puns: 5 gold coins</li>
      <li>2nd level of jokes: 10 gold coins</li>
      <li>3rd level of one-liners : 20 gold coins</li>
    </ul>
  );
}

export function TypographyInlineCode({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export function TypographyLead({ children }: { children: React.ReactNode }) {
  return <p className="text-xl text-muted-foreground">{children}</p>;
}

export function TypographyLarge({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-semibold">Are you absolutely sure?</div>;
}

export function TypographySmall({ children }: { children: React.ReactNode }) {
  return (
    <small className="text-sm font-medium leading-none">Email address</small>
  );
}

export function TypographyMuted({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">Enter your email address.</p>
  );
}
