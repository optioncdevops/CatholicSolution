/** Star indicator shown after a field's label when it's required — one place to style/change it. */
export function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {' '}
      *
    </span>
  );
}
