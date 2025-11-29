import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const TOAST_DURATION = 4000;

function ToastProgress() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-muted overflow-hidden">
      <div 
        className="h-full bg-success origin-left"
        style={{
          animation: `toast-progress ${TOAST_DURATION}ms linear forwards`
        }}
      />
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
            <ToastProgress />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
