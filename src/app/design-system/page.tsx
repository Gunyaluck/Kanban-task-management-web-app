"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-16 rounded-md border border-token ${className}`} />
      <div className="min-w-0">
        <div className="text-sm font-bold">{name}</div>
        <div className="text-sm text-muted">{className}</div>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold md:text-3xl">Design System</h1>
            <p className="text-sm text-muted">
              ตัวอย่าง tokens + components (light/dark) จาก `globals.css`
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface rounded-lg p-5">
            <h2 className="text-lg font-bold">Typography</h2>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-muted">Heading (XL)</div>
                <div className="text-[24px] font-bold leading-[30px]">
                  Plus Jakarta Sans Bold 24px / 30px
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted">Heading (L)</div>
                <div className="text-[18px] font-bold leading-[23px]">
                  Plus Jakarta Sans Bold 18px / 23px
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted">Heading (M)</div>
                <div className="text-[15px] font-bold leading-[19px]">
                  Plus Jakarta Sans Bold 15px / 19px
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted">Heading (S)</div>
                <div className="text-[12px] font-bold leading-[15px] tracking-[2.4px]">
                  HEADING (S)
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted">Body (L)</div>
                <div className="text-[13px] font-medium leading-[23px] text-muted">
                  Body copy ตัวอย่าง: Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Phasellus hendrerit.
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted">Body (M)</div>
                <div className="text-[12px] font-bold leading-[15px] text-muted">
                  Body (M) ตัวอย่าง 12px / 15px (bold ตามสเปค)
                </div>
              </div>
            </div>
          </div>

          <div className="surface rounded-lg p-5">
            <h2 className="text-lg font-bold">Interactive Elements</h2>
            <p className="mt-1 text-sm text-muted">
              ปุ่มด้านล่างใช้ utility classes: `btn`, `btn-l`, `btn-s`,
              `btn-primary`, `btn-secondary`, `btn-danger`
            </p>

            <div className="mt-5 grid gap-6">
              <div className="grid gap-3">
                <div className="text-xs font-bold text-muted">Idle</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn btn-l btn-primary" type="button">
                    Button Primary (L)
                  </button>
                  <button className="btn btn-s btn-primary" type="button">
                    Button Primary (S)
                  </button>
                  <button className="btn btn-s btn-secondary" type="button">
                    Button Secondary
                  </button>
                  <button className="btn btn-s btn-danger" type="button">
                    Button Destructive
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-xs font-bold text-muted">Hover</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="btn btn-l btn-primary hover:btn-primary-hover"
                    type="button"
                  >
                    Button Primary (L)
                  </button>
                  <button
                    className="btn btn-s btn-primary hover:btn-primary-hover"
                    type="button"
                  >
                    Button Primary (S)
                  </button>
                  <button className="btn btn-s btn-secondary hover:btn-secondary-hover" type="button">
                    Button Secondary
                  </button>
                  <button
                    className="btn btn-s btn-danger hover:btn-danger-hover"
                    type="button"
                  >
                    Button Destructive
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="text-xs font-bold text-muted">Surface / Border</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="surface rounded-lg p-4">
                    <div className="text-sm font-bold">Surface</div>
                    <div className="mt-1 text-sm text-muted">
                      ใช้ `surface` + shadow token
                    </div>
                  </div>
                  <div className="rounded-lg border border-token bg-(--color-surface) p-4">
                    <div className="text-sm font-bold">Border token</div>
                    <div className="mt-1 text-sm text-muted">
                      ใช้ `border-token`
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="text-lg font-bold">Color Tokens</h2>
          <p className="mt-1 text-sm text-muted">
            ตัวอย่าง semantic tokens ที่สลับตาม theme: `--color-bg`,
            `--color-surface`, `--color-text`, `--color-text-muted`
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ColorSwatch name="Background" className="bg-(--color-bg)" />
            <ColorSwatch name="Surface" className="bg-(--color-surface)" />
            <ColorSwatch name="Text" className="bg-(--color-text)" />
            <ColorSwatch
              name="Text muted"
              className="bg-(--color-text-muted)"
            />
            <ColorSwatch name="Primary" className="bg-(--color-primary)" />
            <ColorSwatch name="Danger" className="bg-(--color-danger)" />
          </div>
        </section>
      </div>
    </main>
  );
}

