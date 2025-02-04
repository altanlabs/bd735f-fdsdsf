"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveLine } from '@nivo/line';
import axios from 'axios';
import { DigitalClock } from '@/components/blocks/digital-clock';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Rest of the code remains the same...