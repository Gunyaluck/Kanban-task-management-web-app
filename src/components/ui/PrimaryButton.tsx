import Button from "@/components/ui/Button";

type Props = Omit<React.ComponentProps<typeof Button>, "variant">;

export default function PrimaryButton(props: Props) {
  return <Button variant="primary" {...props} />;
}

