'use client';

import { memo } from 'react';

import { AddExpenseSheet } from '@/components/add/AddExpenseSheet';
import { MicSettingsHelpSheet } from '@/components/add/MicSettingsHelpSheet';
import { MicFab } from '@/components/app-shell/MicFab';
import { DraftEditSheet } from '@/components/draft/DraftEditSheet';
import type { HomeExpenseFlow } from '@/app/(app)/home/useHomeExpenseFlow';

type HomeOverlaysProps = {
  flow: HomeExpenseFlow;
};

/** Modals and FAB — separated so the main list does not re-render with sheet typing. */
export const HomeOverlays = memo(function HomeOverlays({ flow }: HomeOverlaysProps) {
  const { add, draft, help, mic, speech } = flow;
  const canDictate = speech.supported && !mic.micBlocked;

  return (
    <>
      <MicFab micBlocked={mic.micBlocked} onPress={mic.onFabPress} />

      <MicSettingsHelpSheet
        onClose={() => help.setHelpOpen(false)}
        onUseManual={() => {
          help.setHelpOpen(false);
          add.openAdd('manual');
        }}
        onUsePrompt={() => {
          help.setHelpOpen(false);
          add.openAdd('prompt');
        }}
        open={help.helpOpen}
      />

      <AddExpenseSheet
        formSession={add.addSession}
        initialTab={add.addInitialTab}
        manualError={add.manualError}
        micBlocked={mic.micBlocked}
        onChooseDraft={(t) => void add.onChooseDraft(t)}
        onChooseSave={(t) => void add.onChooseSave(t)}
        onClose={add.closeAdd}
        onManualDraft={(d) => void add.onManualDraft(d)}
        onManualSave={(d) => void add.onManualSave(d)}
        onRefineManually={add.onRefineManually}
        onSpeechReset={speech.reset}
        onSpeechStart={speech.start}
        onSpeechStop={speech.stop}
        open={add.addOpen}
        parseBusy={add.parseBusy}
        parseError={add.parseError}
        speechError={speech.error}
        speechListening={speech.listening}
        speechSupported={speech.supported}
        speechTranscript={speech.transcript}
        writeBusy={add.writeBusy}
      />

      <DraftEditSheet
        dictating={draft.dictating}
        draft={draft.draft}
        deleting={draft.deleting}
        onChange={draft.onChange}
        onDelete={draft.editingId ? () => void draft.deleteEditing() : undefined}
        onDiscard={draft.discardDraft}
        onNoteChange={draft.onNoteChange}
        onRefineAi={() => void draft.refineWithAi()}
        onSave={() => {
          draft.stopDictation();
          void draft.confirmSaved();
        }}
        onToggleDictation={canDictate ? draft.toggleDictation : undefined}
        open={draft.draftOpen}
        note={draft.pendingTranscript}
        refineError={draft.refineError}
        refining={draft.refineBusy}
        saved={draft.editingSaved}
        saveError={draft.draftWriteError}
        saving={draft.saving}
      />
    </>
  );
});
