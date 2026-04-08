import Button from "@/components/ui/Button";

type Props = Omit<React.ComponentProps<typeof Button>, "variant">;

export default function SecondaryButton(props: Props) {
  return <Button variant="secondary" {...props} />;
}

