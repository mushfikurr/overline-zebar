import { useWidgetSetting } from '@overline-zebar/config';
import { UpdateScriptModal } from '@overline-zebar/config-widget';
import { AppIcon } from '@overline-zebar/config-widget/src/components/icons/AppIcon';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
import { logger } from '@overline-zebar/config/src/utils/logger';
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
  Input,
} from '@overline-zebar/ui';
import { Plus, Search, Settings } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
});

/** Shared interaction tokens so tiles, rows, and footer buttons feel
 * identical: quick hover, tactile press. */
const interactive =
  'outline-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50';

const ITEM_SELECTOR = '[data-launcher-item]';

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const [applications, setApplications] = useWidgetSetting(
    'script-launcher',
    'applications'
  );
  const [view] = useWidgetSetting('script-launcher', 'view');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState<LauncherCommand>({
    id: '',
    title: '',
    command: '',
    args: [],
  });

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      zebar.currentWidget().close();
    });
  }, []);

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  const handleAddOrUpdate = () => {
    if (editingId) {
      setApplications(
        applications.map((app) => (app.id === editingId ? newApp : app))
      );
    } else {
      setApplications([...applications, { ...newApp, id: generateId() }]);
    }
    setNewApp({ id: '', title: '', command: '', args: [] });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewApp({ id: '', title: '', command: '', args: [] });
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (appToEdit: LauncherCommand) => {
    setEditingId(appToEdit.id);
    setNewApp(appToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(
      applications.filter((app: LauncherCommand) => app.id !== id)
    );
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !q
        ? applications
        : applications.filter(
            (app) =>
              app.title.toLowerCase().includes(q) ||
              app.command.toLowerCase().includes(q)
          ),
    [applications, q]
  );

  const moveFocus = useCallback((event: KeyboardEvent, columns: number) => {
    const items = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
        ITEM_SELECTOR
      )
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;

    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
        next = index + 1;
        break;
      case 'ArrowLeft':
        next = index - 1;
        break;
      case 'ArrowDown':
        next = index + columns;
        break;
      case 'ArrowUp':
        next = index - columns;
        break;
      default:
        return;
    }
    if (next < 0 || next >= items.length) return;

    event.preventDefault();
    items[next]?.focus();
  }, []);

  // Column count is derived from the rendered grid so arrow keys match the
  // actual layout at any widget width.
  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.key.startsWith('Arrow')) return;
      const columns = getComputedStyle(
        event.currentTarget as HTMLElement
      ).gridTemplateColumns.split(' ').length;
      moveFocus(event, columns);
    },
    [moveFocus]
  );

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        moveFocus(event, 1);
      }
    },
    [moveFocus]
  );

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <Search className="text-text-muted size-8" strokeWidth={1.5} />
      <h1 className="text-wrap-balance">Scripts you add will show up here</h1>
      <p className="text-text-muted max-w-xs text-pretty">
        These can be .exe paths, AHK scripts you commonly use, or generally just
        any shell command.
      </p>
    </div>
  );

  const noResults = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-wrap-balance">No scripts match “{query}”</h1>
      <p className="text-text-muted">Try a different name or command.</p>
    </div>
  );

  return (
    <div className="text-text relative h-screen select-none overflow-hidden rounded-lg border border-button-border/80 bg-background shadow-sm backdrop-blur-xl antialiased">
      <UpdateScriptModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />
      <div className="flex h-full w-full flex-col">
        {applications.length > 0 && (
          <div className="bg-surface flex shrink-0 items-center p-2 pb-0.5">
            <Input
              leadingIcon={<Search />}
              placeholder="Search scripts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQuery('');
                if (e.key === 'Enter' && filtered.length > 0) {
                  const first = filtered[0];
                  if (first) launch(first, output.glazewm);
                }
              }}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <div className="bg-surface min-h-0 min-w-0 flex-1 overflow-y-auto">
          {applications.length === 0 && emptyState}
          {applications.length > 0 && filtered.length === 0 && noResults}
          {filtered.length > 0 && view !== 'list' && (
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] content-start gap-1 p-2"
              onKeyDown={handleGridKeyDown}
            >
              {filtered.map((application) => (
                <LauncherTile
                  key={application.id}
                  glazewm={output.glazewm}
                  application={application}
                  onEdit={() => handleOpenModalForEdit(application)}
                  onDelete={() => handleDelete(application.id)}
                />
              ))}
            </div>
          )}
          {filtered.length > 0 && view === 'list' && (
            <div
              className="flex flex-col gap-0.5 p-2"
              onKeyDown={handleListKeyDown}
            >
              {filtered.map((application) => (
                <LauncherRow
                  key={application.id}
                  glazewm={output.glazewm}
                  application={application}
                  onEdit={() => handleOpenModalForEdit(application)}
                  onDelete={() => handleDelete(application.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="bg-background text-text flex shrink-0 items-center justify-end gap-2 rounded-md rounded-t-none border-t border-border/60 p-2"
          style={{
            boxShadow:
              'inset 0 4px 10px -6px rgba(0,0,0,0.07), inset 0 14px 28px -14px rgba(0,0,0,0.16)',
          }}
        >
          <Button
            onClick={handleOpenModalForAdd}
            size="icon"
            title="Add script"
            className={interactive}
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </Button>
          <Button
            onClick={handleOnSettingsClick}
            size="icon"
            title="Settings"
            className={interactive}
          >
            <Settings className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LauncherTile({
  glazewm,
  application,
  onEdit,
  onDelete,
}: {
  glazewm: zebar.GlazeWmOutput | null;
  application: LauncherCommand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ContextMenu onOpenChange={setMenuOpen}>
      <ContextMenuTrigger
        render={(triggerProps: ComponentProps<'button'>) => (
          <button
            {...triggerProps}
            type="button"
            data-launcher-item
            onClick={() => launch(application, glazewm)}
            className={`${interactive} text-text-muted hover:text-text active:scale-[0.96] flex h-[4.5rem] min-w-0 flex-col items-center justify-center gap-2 rounded-md p-1.5 hover:bg-button/60 ${
              menuOpen ? 'bg-button/60 text-text' : ''
            }`}
          >
            <AppIcon app={application} className="size-7 shrink-0" />
            <span className="w-full truncate text-center text-xs">
              {application.title}
            </span>
          </button>
        )}
      />
      <LauncherContextMenu
        application={application}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </ContextMenu>
  );
}

function LauncherRow({
  glazewm,
  application,
  onEdit,
  onDelete,
}: {
  glazewm: zebar.GlazeWmOutput | null;
  application: LauncherCommand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ContextMenu onOpenChange={setMenuOpen}>
      <ContextMenuTrigger
        render={(triggerProps: ComponentProps<'button'>) => (
          <button
            {...triggerProps}
            type="button"
            data-launcher-item
            onClick={() => launch(application, glazewm)}
            className={`${interactive} text-text hover:bg-button/60 active:bg-button flex min-w-0 items-center gap-4 rounded-md px-3 py-1.5 text-left ${
              menuOpen ? 'bg-button/60' : ''
            }`}
          >
            <AppIcon app={application} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-sm leading-none translate-y-[1px]">
              {application.title}
            </span>
            <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none translate-y-[1px]">
              {application.command}
            </span>
          </button>
        )}
      />
      <LauncherContextMenu
        application={application}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </ContextMenu>
  );
}

function LauncherContextMenu({
  application,
  onEdit,
  onDelete,
}: {
  application: LauncherCommand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuLabel className="max-w-56 truncate">
          {application.title}
        </ContextMenuLabel>
        <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}

async function launch(
  application: LauncherCommand,
  glazewm: zebar.GlazeWmOutput | null
) {
  if (!glazewm) return;
  logger.log('Launching command', application.command, application.args);
  await glazewm.runCommand(
    `shell-exec ${application.command} ${application.args.join(' ')}`
  );
}

export default App;
