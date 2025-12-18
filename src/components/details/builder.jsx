import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContext, useEffect, useRef, useState } from 'react';
import { Plus, X, Check } from "lucide-react";
import geminiIcon from "@/icons/google-gemini-icon.svg";
import Image from "next/image"
import { createStrategy, getUserStrategies, updateStrategy, deleteStrategy, createEmotion, getUserEmotions, updateEmotion, deleteEmotion, updateUserDocument } from '@/lib/firebase/database/index';
import { toast } from "sonner";
import { JournalContext } from './journalDetailsProvider';
import useGlobalState from '@/hooks/globalState';
import { trackEvent } from '@/lib/mixpanelClient';
import { parseBrokerTimestamp } from '../journal/calenderView';
import { truncateText } from '@/lib/utils';


export default function Builder() {
  // State management
  const [strategies, setStrategies] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // Emotion state management
  const [mistakes, setEmotions] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isCreatingNewEmotion, setIsCreatingNewEmotion] = useState(false);

  // Form state
  const [strategyName, setStrategyName] = useState('');

  // Emotion form state
  const [emotionName, setEmotionName] = useState('');

  // Separate hover states for strategies and mistakes
  const [hoveredStrategyIndex, setHoveredStrategyIndex] = useState(null);
  const [hoveredEmotionIndex, setHoveredEmotionIndex] = useState(null);

  // Suggestions arrays
  const strategySuggestions = [
    "3 candle setup",
    "9, 20 ema strategy",
    "Breakout strategy",
    "Support resistance",
    "Moving average crossover",
    "RSI divergence"
  ];

  const emotionSuggestions = [
'not calculated risk',
'did not put SL',
'random trade' ,
'early entry',
'late entry',
'exited early',
'Not followed my SL',
'against the trend'
  ];

  const strategyNameRef = useRef();

  // Load strategies and mistakes on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadStrategies(), loadEmotions()]);
    };
    initializeData();
  }, []);

  const loadStrategies = async () => {
    console.log('🔄 Loading strategies...');
    try {
      const response = await getUserStrategies();
      console.log('🔄 Got strategies response:', response);

      const strategiesArray = Array.isArray(response) ? response : [];
      setStrategies(strategiesArray);
      console.log('✅ Loaded strategies successfully:', strategiesArray.length);
    } catch (error) {
      console.error('❌ Error loading strategies:', error);
      setStrategies([]);
      toast.error('Failed to load strategies');
    }
  };

  const loadEmotions = async () => {
    console.log('🔄 Loading mistakes...');
    try {
      const response = await getUserEmotions();
      console.log('🔄 Got mistakes response:', response);

      const emotionsArray = Array.isArray(response) ? response : [];
      setEmotions(emotionsArray);
      console.log('✅ Loaded mistakes successfully:', emotionsArray.length);
    } catch (error) {
      console.error('❌ Error loading mistakes:', error);
      setEmotions([]);
      toast.error('Failed to load mistakes');
    }
  };

  const resetForm = () => {
    setStrategyName('');
    setIsCreatingNew(false);
  };

  const resetEmotionForm = () => {
    setEmotionName('');
    setCurrentEmotion(null);
    setIsCreatingNewEmotion(false);
  };

  const handleCreateNewStrategy = () => {
    resetForm();
    setIsCreatingNew(true);
    // Focus on the strategy name input after a short delay
    setTimeout(() => {
      strategyNameRef.current?.focus();
    }, 100);
  };

  const handleCreateNewEmotion = () => {
    resetEmotionForm();
    setIsCreatingNewEmotion(true);
  };

  const handleSaveStrategy = async () => {
    if (!strategyName.trim()) {
      toast.error('Please enter a strategy name');
      return;
    }

    const strategyData = {
      name: strategyName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setLoading(true);
      await createStrategy(strategyData);
      toast.success('Strategy created successfully');
      trackEvent('strategy_created', { name: strategyData.name });
      await loadStrategies();
      resetForm();
    }
    catch (error) {
      console.error('❌ Error saving strategy:', error);
      toast.error('Failed to save strategy: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStrategy = async (strategyId) => {

    try {
      setLoading(true);
      await deleteStrategy(strategyId);
      toast.success('Strategy deleted successfully');

      // Reload strategies
      await loadStrategies();
    } catch (error) {
      console.error('❌ Error deleting strategy:', error);
      toast.error('Failed to delete strategy: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Emotion handler functions
  const handleSaveEmotion = async () => {
    if (!emotionName.trim()) {
      toast.error('Please enter an mistake name');
      return;
    }

    const emotionData = {
      name: emotionName.trim(),
      description: "",
      triggers: [],
      strategies: [],
      additionalNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setLoading(true);

      if (currentEmotion) {
        // Update existing mistake
        console.log('📝 Updating existing mistake:', currentEmotion.id);
        await updateEmotion(currentEmotion.id, {
          ...emotionData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Emotion updated successfully');
      } else {
        // Create new mistake
        console.log('📝 Creating new mistake...');
        await createEmotion(emotionData);
        toast.success('Emotion created successfully');
        trackEvent('mistake_created', { name: emotionData.name });
      }

      // Reload mistakes to get the latest data
      await loadEmotions();
      resetEmotionForm();

    } catch (error) {
      console.error('❌ Error saving mistake:', error);
      toast.error('Failed to save mistake: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmotion = async (emotionId) => {
    try {
      setLoading(true);
      await deleteEmotion(emotionId);
      toast.success('Emotion deleted successfully');

      // Reload mistakes
      await loadEmotions();

      // Reset form if the deleted mistake was currently selected
      if (currentEmotion?.id === emotionId) {
        resetEmotionForm();
      }
    } catch (error) {
      console.error('❌ Error deleting mistake:', error);
      toast.error('Failed to delete mistake: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmotionSuggestion = (emotionName) => {
    setEmotionName(emotionName);
    setIsCreatingNewEmotion(true);
    setCurrentEmotion(null);
  };

  const handleAddStrategySuggestion = (strategyName) => {
    setStrategyName(strategyName);
    setIsCreatingNew(true);
  };

  const { selectedTrade, todaysTrade, selectedDate } = useContext(JournalContext);

  console.log(todaysTrade, "todaysTrade");

  const { data } = useGlobalState()

  const todaysDocs = data?.find((doc) => {
    const rawDate = doc.trades?.date;
    if (!rawDate || !selectedDate) return false;

    const parsedDate = parseBrokerTimestamp(rawDate);
    if (!parsedDate) return false;
    return `${new Date(parsedDate).getFullYear()}-${new Date(parsedDate).getMonth()}-${new Date(parsedDate).getDate()}` === selectedDate;
  });

  const docId = todaysDocs?.id;

  const handleSaveStrategyForCurrentTrade = async (strategy) => {
    try {
      console.log('Saving strategy for current trade:', strategy);

      if (!docId) throw new Error("Document ID not found");

      await updateUserDocument("journal", docId, {
        [`trades.${selectedTrade}.strategy`]: strategy.name,
        updated_at: new Date()
      });
      // trackEvent('selected_strategy', { name: strategy.name });
      toast.success("Strategy saved!");
    } catch (err) {
      toast.error("Failed to save strategy.");
      console.error("Error saving strategy:", err);
    }
  };

  const handleSaveMistakeForCurrentTrade = async (mistake) => {
    try {
      console.log('Saving strategy for current trade:', mistake);

      if (!docId) throw new Error("Document ID not found");

      await updateUserDocument("journal", docId, {
        [`trades.${selectedTrade}.mistake`]: mistake.name,
        updated_at: new Date()
      });
      toast.success("Mistake saved!");
      trackEvent('selected_mistake', { name: mistake.name });

    } catch (err) {
      toast.error("Failed to save mistake.");
      console.error("Error saving mistake:", err);
    }
  };

  return (
<div className="flex flex-col gap-2 lg:h-[calc(100vh-6.8rem)]">
                 {/* Strategy List */}
      <Card className="rounded flex flex-col lg:h-1/2 lg:overflow-hidden overflow-y-scroll h-80 m-0 p-0">
        <CardContent className=" flex flex-col gap-4 overflow-y-auto custom-scroll m-0 p-4">
          {/* Strategy Creation/Selection */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Add Button with Dynamic Text */}
            <div className="flex items-center gap-2 h-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewStrategy}
                disabled={loading}
                className="flex items-center gap-2 justify-center cursor-pointer"
              >
                <span className='rounded-full bg-green-500 p-0.5'>
                  <Plus className='size-3 text-white' />
                </span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                  Create Strategy tag
                </span>
              </Button>
            </div>

            {/* Strategy Name Input (when creating new) */}
            {isCreatingNew && (
              <div className="flex gap-2 items-center">
                <Input
                  ref={strategyNameRef}
                  type="text"
                  placeholder="Strategy name"
                  className="w-32"
                  value={strategyName}
                  size="sm"
                  onChange={(e) => setStrategyName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveStrategy();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveStrategy}
                  disabled={loading || !strategyName.trim()}
                  className="cursor-pointer"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                  className="cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}


          </div>

          {/* Existing Strategies - shown to the right of "My setups" text */}
          <div className='flex flex-col gap-4'>
            <div>
              <span className="text-sm font-medium">My Strategies</span>
            </div>
            {strategies.length > 0 && (
              <div className="flex gap-2 flex-wrap overflow-hidden">
                {strategies.map((strategy, index) => (
                  <div
                    key={strategy.id}
                    className="relative flex items-center flex-shrink-0"
                    onMouseEnter={() => setHoveredStrategyIndex(index)}
                    onMouseLeave={() => setHoveredStrategyIndex(null)}
                  >
                    <Button
                      variant={todaysDocs?.trades?.[selectedTrade]?.strategy === strategy.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleSaveStrategyForCurrentTrade(strategy);
                        trackEvent('selected_strategy', { name: strategy.name });
                      }} disabled={loading}
                      className="capitalize whitespace-nowrap pr-8"
                    >
                      {truncateText(strategy.name,35)}
                    </Button>
                    
                    {hoveredStrategyIndex === index && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStrategy(strategy.id);
                        }}
                        className="absolute flex justify-center items-center right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div>
                <Image src={geminiIcon} alt="gemini" width={20} height={20} className="w-4 h-4 ml-1" />
              </div>
              <span className="text-sm font-medium">Suggestions</span>
            </div>
            <div className='flex gap-2 flex-wrap overflow-hidden'>
              {strategySuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStrategySuggestion(suggestion)}
                  className="whitespace-nowrap flex-shrink-0 capitalize"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Emotion List */}
      <Card className="rounded flex flex-col lg:h-1/2 lg:overflow-hidden overflow-y-scroll h-80 m-0 p-0">
        <CardContent className=" flex flex-col gap-4 overflow-y-auto custom-scroll m-0 p-4">

          {/* Create Emotion */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Add Emotion Button with Dynamic Text */}
            <div className="flex items-center gap-2 h-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNewEmotion}
                disabled={loading}
                className="flex items-center gap-2 justify-center cursor-pointer"
              >
                <span className='rounded-full bg-blue-500 p-0.5'>
                  <Plus className='size-3 text-white' />
                </span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                  Create Mistake tag
                </span>
              </Button>
            </div>

            {/* Emotion Name Input (when creating new) */}
            {isCreatingNewEmotion && (
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Emotion name"
                  className="w-32"
                  size="sm"
                  value={emotionName}
                  onChange={(e) => setEmotionName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEmotion();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveEmotion}
                  disabled={loading || !emotionName.trim()}
                >
                  <Check className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewEmotion(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

          </div>

          {/* My Mistakes */}
          <div className='flex flex-col gap-4'>
            {/* Existing Mistakes - shown to the right of "My mistakes" text */}
            <div>
              <span className="text-sm font-medium">My Mistake</span>
            </div>
            {mistakes.length > 0 && (
              <div className="flex gap-2 flex-wrap overflow-hidden">
                {mistakes.map((mistake, index) => (
                  <div
                    key={mistake.id}
                    className="relative flex items-center flex-shrink-0"
                    onMouseEnter={() => setHoveredEmotionIndex(index)}
                    onMouseLeave={() => setHoveredEmotionIndex(null)}
                  >
                    <Button
                      variant={todaysDocs?.trades?.[selectedTrade]?.mistake === mistake.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleSaveMistakeForCurrentTrade(mistake);
                        trackEvent('selected_mistake', { name: mistake.name });
                      }}
                      disabled={loading}
                      className="capitalize whitespace-nowrap pr-8"
                    >
                      {truncateText(mistake.name,35)}
                    </Button>

                    {hoveredEmotionIndex === index && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmotion(mistake.id);
                        }}
                        className="absolute flex justify-center items-center right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emotion Suggestions */}
          <div className="flex flex-col gap-4 mt-2">
            <div className='flex items-center gap-2'>
              <Image src={geminiIcon} alt="gemini" width={20} height={20} className="w-4 h-4 ml-1" />
              <span className="text-sm font-medium">Mistake</span>
            </div>

            <div className='flex gap-2 flex-wrap overflow-hidden'>
              {emotionSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddEmotionSuggestion(suggestion)}
                  className="whitespace-nowrap flex-shrink-0 capitalize "
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div >
  )
}